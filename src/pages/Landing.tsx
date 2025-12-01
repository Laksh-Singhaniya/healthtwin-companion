import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Activity, Brain, Calendar, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userRole) {
      if (userRole === "doctor") navigate("/doctor-portal");
      else if (userRole === "patient") navigate("/patient-dashboard");
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary font-medium">AI-Powered Healthcare Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Your Complete Digital Health Twin
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Experience the future of healthcare with AI-powered predictions, real-time monitoring, and seamless doctor-patient collaboration
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth?role=patient")}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                <Heart className="mr-2 h-5 w-5" />
                Sign Up as Patient
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth?role=doctor")}
                className="text-lg px-8 py-6 border-2"
              >
                <Activity className="mr-2 h-5 w-5" />
                Join as Doctor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Powerful Features for Better Health</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Value Propositions */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Patients */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-primary">For Patients</h3>
              <ul className="space-y-4">
                {patientBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Doctors */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-blue-600">For Doctors</h3>
              <ul className="space-y-4">
                {doctorBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Healthcare Experience?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of patients and doctors already using our platform</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/auth?role=patient")}
              className="text-lg px-8"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Digital Health Twin. All rights reserved.</p>
          <div className="mt-4 space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: <Brain className="h-7 w-7 text-white" />,
    title: "AI Health Assistant",
    description: "Get personalized health insights and recommendations powered by advanced AI"
  },
  {
    icon: <Activity className="h-7 w-7 text-white" />,
    title: "Real-time Monitoring",
    description: "Track your vital signs and health metrics in real-time with smart alerts"
  },
  {
    icon: <Heart className="h-7 w-7 text-white" />,
    title: "Women's Health Focus",
    description: "Specialized tracking for menstrual cycles, pregnancy, and women-specific health needs"
  },
  {
    icon: <Calendar className="h-7 w-7 text-white" />,
    title: "Doctor Consultations",
    description: "Book appointments and consult with verified healthcare professionals"
  },
  {
    icon: <Shield className="h-7 w-7 text-white" />,
    title: "Secure Health Records",
    description: "Your health data is encrypted and protected with enterprise-grade security"
  },
  {
    icon: <Users className="h-7 w-7 text-white" />,
    title: "Predictive Analytics",
    description: "Anticipate health risks with ML-powered predictions and early warnings"
  }
];

const patientBenefits = [
  "Take control of your complete health journey",
  "Get AI-powered insights and predictions",
  "Connect with verified doctors instantly",
  "Track women's health with specialized tools",
  "Secure, private, and HIPAA-compliant data storage"
];

const doctorBenefits = [
  "Manage patients efficiently with comprehensive dashboards",
  "Access complete health histories and real-time data",
  "Provide virtual consultations seamlessly",
  "Receive AI-assisted diagnostic support",
  "Streamline appointment and prescription management"
];

export default Landing;
