import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  FileSearch,
  FolderKanban,
  Building2,
  Users,
  LogOut,
} from "lucide-react";

function NavLink({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
            SK
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Konsultasi SK</p>
            <p className="text-[10px] text-muted-foreground">Bagian Hukum — Setda</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          <NavLink to="/" icon={LayoutDashboard} label="Beranda" active={location.pathname === "/"} />
          <NavLink to="/submissions/new" icon={FilePlus} label="Ajukan SK" active={location.pathname === "/submissions/new"} />
          <NavLink to="/tracking" icon={FileSearch} label="Tracking" active={location.pathname === "/tracking"} />
          {user?.role === "super_admin" && (
            <>
              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
              <NavLink to="/admin/kategori" icon={FolderKanban} label="Kategori" active={location.pathname === "/admin/kategori"} />
              <NavLink to="/admin/instansi" icon={Building2} label="Instansi" active={location.pathname === "/admin/instansi"} />
              <NavLink to="/admin/akun" icon={Users} label="Akun" active={location.pathname === "/admin/akun"} />
            </>
          )}
        </nav>

        <div className="border-t border-border px-3 py-3">
          <p className="text-xs font-medium text-foreground">{user?.nama_lengkap}</p>
          <p className="text-[10px] capitalize text-muted-foreground">{user?.role}</p>
        </div>

        <button onClick={logout} className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <LogOut size={16} /> Keluar
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 pt-4 pb-24 md:pb-6">{children}</main>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card py-2 md:hidden">
        <Link to="/" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/" ? "text-primary" : "text-muted-foreground"}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Beranda</span>
        </Link>
        <Link to="/submissions/new" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/submissions/new" ? "text-primary" : "text-muted-foreground"}`}>
          <FilePlus size={20} />
          <span className="text-[10px]">Ajukan</span>
        </Link>
        <Link to="/tracking" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/tracking" ? "text-primary" : "text-muted-foreground"}`}>
          <FileSearch size={20} />
          <span className="text-[10px]">Tracking</span>
        </Link>
        {user?.role === "super_admin" && (
          <Link to="/admin/kategori" className={`flex flex-col items-center gap-0.5 ${location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"}`}>
            <FolderKanban size={20} />
            <span className="text-[10px]">Admin</span>
          </Link>
        )}
      </nav>

      {/* Safe bottom spacing on mobile */}
      <div className="safe-bottom md:hidden" />
    </div>
  );
}
