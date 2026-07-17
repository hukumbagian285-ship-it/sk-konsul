import { useAuth } from "@/lib/auth-context";
import { useSubmissions } from "@/lib/api";
import { STATUS_URUTAN, STATUS_WARNA, statusProgress } from "@/lib/types";
import { formatTanggal } from "@/lib/utils";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

function Timeline({ status }: { status: string }) {
  const idx = STATUS_URUTAN.indexOf(status as any);
  return (
    <ol className="flex items-center gap-0">
      {STATUS_URUTAN.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} className="flex items-center">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                done ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            {i < STATUS_URUTAN.length - 1 && (
              <span className={`mx-1 h-0.5 w-8 sm:w-12 ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function TrackingPage() {
  const { user } = useAuth();
  const { data: submissions, isLoading } = useSubmissions("pemohon", user?.id, user?.instansi_id);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-foreground mb-4">Lacak Pengajuan SK</h1>
      {(!submissions || submissions.length === 0) && (
        <p className="text-sm text-muted-foreground">Belum ada pengajuan.</p>
      )}
      <div className="space-y-3">
        {(submissions ?? []).map((s) => {
          const open = expanded === s.id;
          const prog = statusProgress(s.status);
          return (
            <div key={s.id} className="rounded-lg border border-border bg-card">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpanded(open ? null : s.id)}
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{s.nomor_tiket}</p>
                  <p className="truncate font-medium text-foreground">{s.judul_sk}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_WARNA[s.status]}>{s.status}</Badge>
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>
              {open && (
                <div className="border-t border-border px-4 py-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress {prog.current}/{prog.total}</span>
                    <span>Diajukan {formatTanggal(s.created_at)}</span>
                  </div>
                  <Timeline status={s.status} />
                  <ol className="mt-4 space-y-2">
                    {STATUS_URUTAN.map((st, i) => {
                      const done = i <= STATUS_URUTAN.indexOf(s.status);
                      return (
                        <li key={st} className="flex items-start gap-2">
                          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${done ? "bg-primary" : "bg-border"}`} />
                          <span className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {st}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}