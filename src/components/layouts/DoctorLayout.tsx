import { BaseLayout } from "./BaseLayout";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare,
  User
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";

const doctorNavItems = [
  { to: "/doctor-portal", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/patients", icon: Users, label: "My Patients" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/messages", icon: MessageSquare, label: "Messages" },
  { to: "/doctor/profile", icon: User, label: "Profile" },
];

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export const DoctorLayout = ({ children }: DoctorLayoutProps) => {
  const location = useLocation();

  const navigation = (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {doctorNavItems.map((item) => {
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
    <BaseLayout navigation={navigation} roleLabel="Doctor">
      {children}
    </BaseLayout>
  );
};
