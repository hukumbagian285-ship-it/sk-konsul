import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Scale, FilePlus2, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import DashboardKanban from "@/pages/DashboardKanban";
import SubmissionForm from "@/pages/SubmissionForm";
import SubmissionDetail from "@/pages/SubmissionDetail";
import LoginPage from "@/pages/LoginPage";

function Header() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isForm = location.pathname === "/submissions/new";

  if (loading) return null;

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale size={18} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">Konsultasi SK</p>
            <p className="text-xs text-muted-foreground">Bagian Hukum — Setda Kab. Sumba Barat</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {!isForm && user && (user.role === "pemohon" || user.role === "super_admin") && (
            <Link
              to="/submissions/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <FilePlus2 size={16} />
              Ajukan SK Baru
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{user.nama_lengkap}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {user.role?.replace("_", " ") ?? "—"}
                </p>
              </div>
              <button
                onClick={() => { supabase.auth.signOut(); navigate("/login"); }}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!user) return <LoginPage />;
  return <>{children}</>;
}

function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={<ProtectedRoute><DashboardKanban /></ProtectedRoute>}
          />
          <Route
            path="/submissions/new"
            element={<ProtectedRoute><SubmissionForm /></ProtectedRoute>}
          />
          <Route
            path="/submissions/:id"
            element={<ProtectedRoute><SubmissionDetail /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
