import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Heart, Phone, AlertTriangle, Pill } from "lucide-react";
import { format } from "date-fns";

interface HealthCardProps {
  healthProfile: {
    health_id: string;
    blood_type?: string;
    date_of_birth?: string;
    gender?: string;
    height?: number;
    weight?: number;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  allergies?: Array<{ allergen: string; severity?: string }>;
  medications?: Array<{ name: string; dosage?: string }>;
  userName?: string;
}

export const HealthCard = ({
  healthProfile,
  emergencyContact,
  allergies = [],
  medications = [],
  userName = "User",
}: HealthCardProps) => {
  const qrCodeUrl = `${window.location.origin}/health-card/${healthProfile.health_id}`;
  
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-large border-border/50" id="health-card-content">
      <CardHeader className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background/20 rounded-lg">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Digital Health Card</CardTitle>
              <p className="text-sm text-primary-foreground/80">{userName}</p>
            </div>
          </div>
          <div className="bg-background p-3 rounded-lg">
            <QRCodeSVG value={qrCodeUrl} size={80} level="H" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Health ID */}
        <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Health ID</p>
            <p className="text-xl font-mono font-bold text-foreground">{healthProfile.health_id}</p>
          </div>
          <Badge variant="outline" className="bg-success-light text-success-foreground border-success">
            Active
          </Badge>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          {healthProfile.blood_type && (
            <div className="p-3 bg-accent-light rounded-lg">
              <p className="text-xs text-muted-foreground">Blood Type</p>
              <p className="text-lg font-semibold text-foreground">{healthProfile.blood_type}</p>
            </div>
          )}
          {healthProfile.date_of_birth && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-lg font-semibold text-foreground">
                {format(new Date(healthProfile.date_of_birth), "MMM dd, yyyy")}
              </p>
            </div>
          )}
          {healthProfile.gender && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="text-lg font-semibold text-foreground capitalize">{healthProfile.gender}</p>
            </div>
          )}
          {healthProfile.height && healthProfile.weight && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Height / Weight</p>
              <p className="text-lg font-semibold text-foreground">
                {healthProfile.height}cm / {healthProfile.weight}kg
              </p>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        {emergencyContact && (
          <div className="p-4 bg-warning-light border-l-4 border-warning rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-warning" />
              <p className="font-semibold text-foreground">Emergency Contact</p>
            </div>
            <p className="text-sm text-foreground">{emergencyContact.name} ({emergencyContact.relationship})</p>
            <p className="text-sm font-mono text-foreground">{emergencyContact.phone}</p>
          </div>
        )}

        {/* Allergies */}
        {allergies.length > 0 && (
          <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="font-semibold text-foreground">Allergies</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive">
                  {allergy.allergen} {allergy.severity && `(${allergy.severity})`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {medications.length > 0 && (
          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-primary" />
              <p className="font-semibold text-foreground">Current Medications</p>
            </div>
            <div className="space-y-1">
              {medications.map((med, index) => (
                <p key={index} className="text-sm text-foreground">
                  • {med.name} {med.dosage && `- ${med.dosage}`}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground pt-4 border-t border-border">
          This digital health card contains critical medical information. In case of emergency, scan the QR code for immediate access.
        </p>
      </CardContent>
    </Card>
  );
};
