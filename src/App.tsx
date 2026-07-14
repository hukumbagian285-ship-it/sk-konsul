import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import DashboardKanban from "@/pages/DashboardKanban";
import SubmissionForm from "@/pages/SubmissionForm";
import SubmissionDetail from "@/pages/SubmissionDetail";
import LoginPage from "@/pages/LoginPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import InstansiPage from "@/pages/admin/InstansiPage";
import UsersPage from "@/pages/admin/UsersPage";
import AppLayout from "@/components/AppLayout";

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
              <Route path="/" element={<DashboardKanban />} />
              <Route path="/submissions/new" element={<SubmissionForm />} />
              <Route path="/submissions/:id" element={<SubmissionDetail />} />
              <Route path="/admin/kategori" element={<CategoriesPage />} />
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
