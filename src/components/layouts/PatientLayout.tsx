import { BaseLayout } from "./BaseLayout";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Activity, 
  Heart, 
  Pill, 
  Calendar, 
  MessageSquare,
  FileText,
  TrendingUp,
  IdCard,
  User,
  Video,
  Dna,
  Sparkles
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";

const patientNavItems = [
  { to: "/patient-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patient/profile", icon: User, label: "Profile" },
  { to: "/health-card", icon: IdCard, label: "Health Card" },
  { to: "/health-monitoring", icon: Activity, label: "Vital Signs" },
  { to: "/womens-health", icon: Heart, label: "Women's Health" },
  { to: "/medications", icon: Pill, label: "Medications" },
  { to: "/patient/appointments", icon: Calendar, label: "Appointments" },
  { to: "/patient/video-consultation", icon: Video, label: "Video Consult" },
  { to: "/patient/my-doctors", icon: User, label: "My Doctors" },
  { to: "/patient/messages", icon: MessageSquare, label: "Messages" },
  { to: "/health-chat", icon: MessageSquare, label: "AI Assistant" },
  { to: "/health-predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/digital-twin", icon: Dna, label: "Digital Twin" },
  { to: "/health-xai", icon: Sparkles, label: "XAI Insights" },
  { to: "/emergency-contacts", icon: FileText, label: "Emergency" },
];

interface PatientLayoutProps {
  children: React.ReactNode;
}

export const PatientLayout = ({ children }: PatientLayoutProps) => {
  const location = useLocation();

  const navigation = (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {patientNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <NavLink to={item.to} icon={<item.icon className="h-4 w-4" />}>
                    {item.label}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <BaseLayout navigation={navigation} roleLabel="Patient">
      {children}
    </BaseLayout>
  );
};
