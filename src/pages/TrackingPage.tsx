import { useAuth } from "@/lib/auth-context";
import { useSubmissions, useStatusHistory } from "@/lib/api";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { formatTanggal } from "@/lib/utils";
import { STATUS_WARNA, STATUS_URUTAN, statusProgress } from "@/lib/types";
import { useState } from "react";

function Timeline({ submissionId }: { submissionId: string }) {
  const { data: history } = useStatusHistory(submissionId);
  if (!history || history.length === 0) return null;

  const reversed = [...history].reverse();

  return (
    <div className="mt-2 space-y-1 border-l-2 border-border pl-3">
      {reversed.map((h) => {
        const isRevisi = h.status_baru === "Revisi Pemohon";
        return (
          <div key={h.id} className="relative">
            <span className={`absolute -left-[15px] top-1 h-2 w-2 rounded-full ${isRevisi ? "bg-amber-500" : "bg-primary"}`} />
            <p className="text-xs font-medium">{h.status_baru}</p>
            <p className="text-xs text-muted-foreground">{formatTanggal(h.created_at)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackingPage() {
  const { user } = useAuth();
  const { data: submissions, isLoading } = useSubmissions("pemohon", user?.id);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = (submissions ?? []).filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.nomor_tiket.toLowerCase().includes(q) ||
      s.judul_sk.toLowerCase().includes(q)
    );
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  const total = STATUS_URUTAN.length;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-foreground mb-4">Tracking Pengajuan SK</h1>

      <div className="relative mb-4 max-w-sm">
        <input
          className="w-full rounded-lg border border-border bg-card py-2 pl-3 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Cari pengajuan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((s) => {
          const { current } = statusProgress(s.status);
          const isExpanded = expanded === s.id;
          return (
            <div key={s.id} className="rounded-lg border border-border bg-card">
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setExpanded(isExpanded ? null : s.id)}
              >
                <div className="flex-1">
                  <p className="font-mono text-xs text-muted-foreground">{s.nomor_tiket}</p>
                  <p className="font-medium text-foreground">
                    {s.judul_sk}
                    {s.nomor_sk && <span className="ml-2 text-xs text-muted-foreground">({s.nomor_sk})</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-border">
                      <div
                        className="rounded-full bg-primary transition-all"
                        style={{ width: `${(current / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{current}/{total}</span>
                  </div>
                  <Badge className={STATUS_WARNA[s.status]}>{s.status}</Badge>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4">
                  <Timeline submissionId={s.id} />
                  <Link
                    to={`/submissions/${s.id}`}
                    className="mt-2 inline-block text-xs text-primary underline"
                  >
                    Lihat detail →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">Belum ada pengajuan.</p>
        )}
      </div>
    </div>
  );
}
