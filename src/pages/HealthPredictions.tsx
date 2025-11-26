import { useState } from "react";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Activity } from "lucide-react";

const HealthPredictions = () => {
  const [predictions, setPredictions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePredictions = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("health-predictions", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        if (error.message.includes("Rate limits exceeded")) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please try again in a few moments.",
            variant: "destructive",
          });
        } else if (error.message.includes("Payment required")) {
          toast({
            title: "Payment Required",
            description: "Please add funds to continue using AI features.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setPredictions(data.predictions);
      toast({
        title: "Predictions Generated",
        description: "Your health insights are ready.",
      });
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast({
        title: "Error",
        description: "Failed to generate predictions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseSection = (content: string, sectionTitle: string) => {
    const regex = new RegExp(`${sectionTitle}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, "i");
    const match = content.match(regex);
    if (match) {
      return match[1].trim();
    }
    return null;
  };

  const renderPredictions = () => {
    if (!predictions) return null;

    const sections = [
      { title: "Health Trend Analysis", icon: TrendingUp, color: "text-blue-500" },
      { title: "Risk Assessments", icon: AlertTriangle, color: "text-amber-500" },
      { title: "Personalized Recommendations", icon: Lightbulb, color: "text-green-500" },
      { title: "Predictive Insights", icon: Brain, color: "text-purple-500" },
      { title: "Menstrual Cycle Predictions", icon: Activity, color: "text-pink-500" },
    ];

    return (
      <div className="space-y-4">
        {sections.map((section) => {
          const content = parseSection(predictions, section.title);
          if (!content) return null;

          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${section.color}`} />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {content.split("\n").map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> These predictions are AI-generated insights based on your health data. 
              They are for informational purposes only and should not be considered medical advice. 
              Always consult with a qualified healthcare professional for medical decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <PatientLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Health Predictions & Insights</h1>
          <p className="text-muted-foreground">AI-powered analysis of your health data</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Generate AI Predictions
            </CardTitle>
            <CardDescription>
              Analyze your health data to identify trends, risks, and personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generatePredictions} 
              disabled={isLoading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing Your Health Data...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Predictions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {renderPredictions()}
      </div>
    </PatientLayout>
  );
};

export default HealthPredictions;
