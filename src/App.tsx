import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Scale, FilePlus2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/types";
import DashboardKanban from "@/pages/DashboardKanban";
import SubmissionForm from "@/pages/SubmissionForm";
import SubmissionDetail from "@/pages/SubmissionDetail";

function RoleSwitcher() {
  const { user, setRole } = useAuth();
  const roles: Role[] = ["super_admin", "pimpinan", "staf_hukum", "pemohon"];
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      Masuk sebagai
      <select
        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
        value={user.role}
        onChange={(e) => setRole(e.target.value as Role)}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}

function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const isForm = location.pathname === "/submissions/new";

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
          {!isForm && (user.role === "pemohon" || user.role === "super_admin") && (
            <Link
              to="/submissions/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <FilePlus2 size={16} />
              Ajukan SK Baru
            </Link>
          )}
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">{user.nama_lengkap}</p>
            <p className="text-xs capitalize text-muted-foreground">{user.role.replace("_", " ")}</p>
          </div>
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/" element={<DashboardKanban />} />
          <Route path="/submissions/new" element={<SubmissionForm />} />
          <Route path="/submissions/:id" element={<SubmissionDetail />} />
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
