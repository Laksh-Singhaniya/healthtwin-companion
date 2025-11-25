import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const PatientMessages = () => {
  return (
    <PatientLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with your doctors</p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground">Start a conversation with your doctor</p>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientMessages;
