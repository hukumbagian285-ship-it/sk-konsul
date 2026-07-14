import * as React from "react";
import { supabase } from "@/lib/supabase";
import type { Role, Profile } from "@/lib/types";

interface AuthUser {
  id: string;
  nama_lengkap: string;
  role: Role | null;
  nip: string;
  instansi_id: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  profile: Profile | null;
  login: (nip: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "sk_user";

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(loadSession);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const loading = false;

  async function login(nip: string, password: string): Promise<string | null> {
    const { data, error } = await supabase.rpc("verify_login", {
      p_nip: nip,
      p_password: password,
    });

    if (error) return "Terjadi kesalahan sistem.";
    if (!data || data.length === 0) return "NIP atau password salah.";

    const row = data[0] as AuthUser;
    setUser(row);
    setProfile(row as unknown as Profile);
    saveSession(row);
    return null;
  }

  function logout() {
    setUser(null);
    setProfile(null);
    clearSession();
  }

  return (
    <AuthContext.Provider value={{ user, loading, profile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
