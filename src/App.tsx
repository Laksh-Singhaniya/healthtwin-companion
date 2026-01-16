import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import PatientDashboard from "./pages/patient/Dashboard";
import HealthMonitoring from "./pages/HealthMonitoring";
import HealthPredictions from "./pages/HealthPredictions";
import MedicationsAllergies from "./pages/MedicationsAllergies";
import EmergencyContacts from "./pages/EmergencyContacts";
import WomensHealth from "./pages/WomensHealth";
import HealthChat from "./pages/HealthChat";
import DoctorDashboard from "./pages/doctor/Dashboard";
import PatientAppointments from "./pages/patient/Appointments";
import PatientMessages from "./pages/patient/Messages";
import PatientProfile from "./pages/patient/Profile";
import MyDoctors from "./pages/patient/MyDoctors";
import PatientVideoConsultation from "./pages/patient/VideoConsultation";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorMessages from "./pages/doctor/Messages";
import PatientManagement from "./pages/doctor/PatientManagement";
import PatientRecords from "./pages/doctor/PatientRecords";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorVideoConsultation from "./pages/doctor/VideoConsultation";
import HealthCard from "./pages/HealthCard";
import PublicHealthCard from "./pages/PublicHealthCard";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, userRole } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (user) {
    if (userRole === "doctor") return <Navigate to="/doctor-portal" replace />;
    if (userRole === "patient") return <Navigate to="/patient-dashboard" replace />;
    return <>{children}</>;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/health-card/:healthId" element={<PublicHealthCard />} />
            <Route path="/patient-dashboard" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></RoleProtectedRoute>} />
            <Route path="/health-card" element={<RoleProtectedRoute allowedRoles={["patient"]}><HealthCard /></RoleProtectedRoute>} />
            <Route path="/health-monitoring" element={<RoleProtectedRoute allowedRoles={["patient"]}><HealthMonitoring /></RoleProtectedRoute>} />
            <Route path="/health-predictions" element={<RoleProtectedRoute allowedRoles={["patient"]}><HealthPredictions /></RoleProtectedRoute>} />
            <Route path="/medications" element={<RoleProtectedRoute allowedRoles={["patient"]}><MedicationsAllergies /></RoleProtectedRoute>} />
            <Route path="/emergency-contacts" element={<RoleProtectedRoute allowedRoles={["patient"]}><EmergencyContacts /></RoleProtectedRoute>} />
            <Route path="/womens-health" element={<RoleProtectedRoute allowedRoles={["patient"]}><WomensHealth /></RoleProtectedRoute>} />
            <Route path="/health-chat" element={<RoleProtectedRoute allowedRoles={["patient"]}><HealthChat /></RoleProtectedRoute>} />
            <Route path="/patient/appointments" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></RoleProtectedRoute>} />
            <Route path="/patient/messages" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientMessages /></RoleProtectedRoute>} />
            <Route path="/patient/profile" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientProfile /></RoleProtectedRoute>} />
            <Route path="/patient/my-doctors" element={<RoleProtectedRoute allowedRoles={["patient"]}><MyDoctors /></RoleProtectedRoute>} />
            <Route path="/patient/video-consultation" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientVideoConsultation /></RoleProtectedRoute>} />
            <Route path="/doctor-portal" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></RoleProtectedRoute>} />
            <Route path="/doctor/patients" element={<RoleProtectedRoute allowedRoles={["doctor"]}><PatientManagement /></RoleProtectedRoute>} />
            <Route path="/doctor/patients/:patientId/records" element={<RoleProtectedRoute allowedRoles={["doctor"]}><PatientRecords /></RoleProtectedRoute>} />
            <Route path="/doctor/appointments" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorAppointments /></RoleProtectedRoute>} />
            <Route path="/doctor/messages" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorMessages /></RoleProtectedRoute>} />
            <Route path="/doctor/profile" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorProfile /></RoleProtectedRoute>} />
            <Route path="/doctor/video-consultation" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorVideoConsultation /></RoleProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
