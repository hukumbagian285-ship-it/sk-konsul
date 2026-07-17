import { useAuth } from "@/lib/auth-context";
import { useSubmissions } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { formatTanggal } from "@/lib/utils";
import { STATUS_WARNA } from "@/lib/types";
import { useState } from "react";

export default function TableDashboard() {
  const { user } = useAuth();
  const role = user?.role ?? "pemohon";
  const { data: submissions, isLoading } = useSubmissions(role, user?.id, user?.instansi_id);
  const [search, setSearch] = useState("");

  const filtered = (submissions ?? []).filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.nomor_tiket.toLowerCase().includes(q) ||
      s.judul_sk.toLowerCase().includes(q) ||
      ((s as any).instansi_nama?.nama_instansi ?? "").toLowerCase().includes(q)
    );
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-foreground mb-4">Papan Konsultasi SK</h1>
      
      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Cari nomor tiket, judul, atau instansi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nomor Tiket</th>
              <th className="px-4 py-3 font-medium">Judul SK</th>
              <th className="px-4 py-3 font-medium">Instansi</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => (window.location.href = `/submissions/${s.id}`)}
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.nomor_tiket}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.judul_sk}</td>
                <td className="px-4 py-3 text-muted-foreground">{(s as any).instansi_nama?.nama_instansi ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_WARNA[s.status]}>{s.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatTanggal(s.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}