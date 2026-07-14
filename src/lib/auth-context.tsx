import * as React from "react";
import type { Role } from "./types";

// Auth context sementara untuk pengembangan UI sebelum Supabase Auth disambungkan.
// TODO: ganti isi provider ini dengan session Supabase asli (supabase.auth.getSession()
// + subscribe onAuthStateChange), lalu ambil `role` dari tabel `profiles`.

interface AuthUser {
  id: string;
  nama_lengkap: string;
  role: Role;
}

const DEMO_USERS: Record<Role, AuthUser> = {
  super_admin: { id: "demo-super-admin", nama_lengkap: "Super Admin", role: "super_admin" },
  pimpinan: { id: "demo-pimpinan", nama_lengkap: "Ir. Mardiana Kalumbang", role: "pimpinan" },
  staf_hukum: { id: "demo-staf-hukum", nama_lengkap: "Flafianus Dua", role: "staf_hukum" },
  pemohon: { id: "demo-pemohon", nama_lengkap: "Achmad Aqil Susanto, S.Kom", role: "pemohon" },
};

interface AuthContextValue {
  user: AuthUser;
  setRole: (role: Role) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>("staf_hukum");
  const value = React.useMemo(() => ({ user: DEMO_USERS[role], setRole }), [role]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
