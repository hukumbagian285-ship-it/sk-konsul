import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import TableDashboard from "@/pages/TableDashboard";
import SubmissionForm from "@/pages/SubmissionForm";
import SubmissionDetail from "@/pages/SubmissionDetail";
import LoginPage from "@/pages/LoginPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import InstansiPage from "@/pages/admin/InstansiPage";
import UsersPage from "@/pages/admin/UsersPage";
import AppLayout from "@/components/AppLayout";
import TrackingPage from "@/pages/TrackingPage";
import TemplateListPage from "@/pages/TemplateListPage";
import TemplateDetailPage from "@/pages/TemplateDetailPage";
import AdminTemplatePage from "@/pages/admin/AdminTemplatePage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!user) return <LoginPage />;
  return <>{children}</>;
}

function AppShell() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<TableDashboard />} />
              <Route path="/submissions/new" element={<SubmissionForm />} />
              <Route path="/submissions/:id" element={<SubmissionDetail />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/templates" element={<TemplateListPage />} />
              <Route path="/templates/:id" element={<TemplateDetailPage />} />
              <Route path="/admin/kategori" element={<CategoriesPage />} />
              <Route path="/admin/template" element={<AdminTemplatePage />} />
              <Route path="/admin/instansi" element={<InstansiPage />} />
              <Route path="/admin/akun" element={<UsersPage />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
