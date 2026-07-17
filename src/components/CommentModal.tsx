import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, MessageSquare } from "lucide-react";
import { useComments } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatTanggal } from "@/lib/utils";

export default function CommentModal({
  open,
  onClose,
  submissionId,
  onJumpToPage,
  highlightedCommentId,
}: {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  onJumpToPage: (page: number) => void;
  highlightedCommentId?: string;
}) {
  const { data: comments } = useComments(submissionId);
  const WARNA_DOT: Record<string, string> = {
    merah: "bg-red-500",
    kuning: "bg-yellow-500",
    hijau: "bg-green-500",
  };

  useEffect(() => {
    if (highlightedCommentId) {
      const el = document.getElementById(`cmodal-${highlightedCommentId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedCommentId]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex max-h-[80vh] w-full flex-col rounded-t-xl bg-card p-5 shadow-lg sm:mx-4 sm:max-w-md sm:rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare size={14} /> Komentar Perbaikan
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">Klik ikon pena di atas PDF, lalu drag pada teks untuk menambahkan catatan.</p>

        <div className="space-y-2 overflow-y-auto">
          {(!comments || comments.length === 0) && (
            <p className="py-8 text-center text-xs text-muted-foreground">Belum ada komentar.</p>
          )}
          {(comments ?? []).map((c) => (
            <div
              key={c.id}
              id={`cmodal-${c.id}`}
              className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-muted/50 ${
                highlightedCommentId === c.id ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => { c.halaman && onJumpToPage(c.halaman); onClose(); }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  {c.warna && <span className={`inline-block h-2 w-2 rounded-full ${WARNA_DOT[c.warna] ?? "bg-gray-400"}`} />}
                  {(c as any).user_nama?.nama_lengkap}
                </span>
                <span className="text-[10px] text-muted-foreground">{formatTanggal(c.created_at)}</span>
              </div>
              <div className="mb-1 flex gap-1">
                {c.halaman && (
                  <Badge className="border-primary/30 bg-blue-50 text-[10px] text-primary">Hal. {c.halaman}</Badge>
                )}
                {c.lokasi_pasal && (
                  <Badge className="border-accent/30 bg-emerald-50 text-[10px] text-accent">{c.lokasi_pasal}</Badge>
                )}
              </div>
              <p className="text-xs text-foreground">{c.komentar}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}