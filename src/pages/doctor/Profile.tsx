import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

const DoctorProfile = () => {
  return (
    <DoctorLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your professional information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Complete your profile to get started</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
