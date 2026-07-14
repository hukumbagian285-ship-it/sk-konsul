import { useState } from "react";
import { useComments, useCreateComment } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { formatTanggal } from "@/lib/utils";

export default function CommentSidebar({
  submissionId,
  versionId,
  currentPage,
  onJumpToPage,
}: {
  submissionId: string;
  versionId: string;
  currentPage: number;
  onJumpToPage: (page: number) => void;
}) {
  const { user } = useAuth();
  const { data: comments } = useComments(submissionId);
  const createComment = useCreateComment();
  const [komentar, setKomentar] = useState("");
  const [lokasiPasal, setLokasiPasal] = useState("");
  const [halaman, setHalaman] = useState<number>(currentPage);

  async function handleSend() {
    if (!komentar.trim()) return;
    await createComment.mutateAsync({
      submission_id: submissionId,
      version_id: versionId,
      user_id: user!.id,
      komentar: komentar.trim(),
      lokasi_pasal: lokasiPasal.trim() || null,
      halaman: halaman || null,
    });
    setKomentar("");
    setLokasiPasal("");
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MessageSquare size={14} /> Komentar Perbaikan
      </h3>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex gap-2">
          <input
            className="w-16 rounded-md border border-border bg-card px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Hal."
            type="number"
            min={1}
            value={halaman}
            onChange={(e) => setHalaman(Number(e.target.value))}
          />
          <input
            className="flex-1 rounded-md border border-border bg-card px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Pasal (contoh: Pasal 4 Ayat 2)"
            value={lokasiPasal}
            onChange={(e) => setLokasiPasal(e.target.value)}
          />
        </div>
        <Textarea
          placeholder="Tulis catatan perbaikan..."
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
        />
        <div className="flex justify-end">
          <Button size="sm" disabled={!komentar.trim() || createComment.isPending} onClick={handleSend}><Send size={12} className="mr-1" /> Kirim</Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {(!comments || comments.length === 0) && (
          <p className="py-8 text-center text-xs text-muted-foreground">Belum ada komentar.</p>
        )}
        {(comments ?? []).map((c) => (
          <div
            key={c.id}
            className="cursor-pointer rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
            onClick={() => c.halaman && onJumpToPage(c.halaman)}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium">{(c as any).user_nama?.nama_lengkap}</span>
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
  );
}
