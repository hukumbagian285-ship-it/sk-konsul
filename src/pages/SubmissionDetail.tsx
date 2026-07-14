import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, MessageSquare, History, UploadCloud, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { STATUS_WARNA, TRANSISI_SAH, type StatusSK } from "@/lib/types";
import { formatTanggal, cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useSubmission, useVersions, useStatusHistory, useCreateComment, useUpdateStatus } from "@/lib/api";
import PdfViewer from "@/components/PdfViewer";
import CommentSidebar from "@/components/CommentSidebar";
import FinalisasiModal from "@/components/FinalisasiModal";
import { supabase } from "@/lib/supabase";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: submission, isLoading } = useSubmission(id);
  const { data: versions } = useVersions(id);
  const { data: history } = useStatusHistory(id);
  const updateStatus = useUpdateStatus();

  const [showFinalModal, setShowFinalModal] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!submission || !user) {
    return <div className="text-center text-muted-foreground">Pengajuan tidak ditemukan. <Link to="/" className="text-primary underline">Kembali ke papan</Link></div>;
  }
  const sub = submission!;
  const usr = user!;

  const role = usr.role ?? "pemohon";
  const bolehUploadVersi = (role === "pemohon" && sub.pemohon_id === usr.id) || role === "super_admin";
  const transisiTersedia = TRANSISI_SAH[role]?.[sub.status] ?? [];
  const latestVersion = (versions ?? [])[0];

  async function handleTransisi(status: StatusSK) {
    if (status === "Finalisasi") {
      setShowFinalModal(true);
      return;
    }
    await updateStatus.mutateAsync({ id: sub!.id, status });
  }

  async function handleFinalisasi(nomorSk: string) {
    await updateStatus.mutateAsync({ id: sub!.id, status: "Finalisasi" as StatusSK });
    await supabase.from("sk_submissions").update({ nomor_sk: nomorSk }).eq("id", sub!.id);
    setShowFinalModal(false);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Kembali ke papan
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ticket-tag mb-1">{sub.nomor_tiket}</p>
          <h1 className="font-display text-2xl font-semibold text-foreground">{sub.judul_sk}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(sub as any).instansi_nama?.nama_instansi} · {(sub as any).kategori_nama?.nama_kategori}
          </p>
          {sub.nomor_sk && (
            <p className="mt-1 text-xs text-muted-foreground">Nomor SK: {sub.nomor_sk}</p>
          )}
        </div>
        <Badge className={cn("border px-3 py-1 text-sm", STATUS_WARNA[sub.status])}>{sub.status}</Badge>
      </div>

      {sub.deskripsi && (
        <p className="mb-6 rounded-md border border-border bg-muted p-3 text-sm text-foreground">{sub.deskripsi}</p>
      )}

      {transisiTersedia.length > 0 && (
        <Card className="mb-6 border-primary/30">
          <CardContent className="flex flex-wrap items-center gap-2 p-4">
            <span className="text-sm font-medium text-foreground">Aksi:</span>
            {transisiTersedia.map((next) => (
              <Button
                key={next}
                size="sm"
                variant={next === "Revisi Pemohon" ? "outline" : "default"}
                onClick={() => handleTransisi(next)}
                disabled={updateStatus.isPending}
              >
                {next === "Revisi Pemohon" ? `Kembalikan ke ${next}` : `Lanjutkan ke ${next}`}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {latestVersion ? (
            <Card>
              <CardContent className="p-2">
                <PdfViewer driveFileId={latestVersion.drive_file_id} onPageChange={setCurrentPage} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Belum ada dokumen diunggah.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {latestVersion && (
            <CommentSidebar
              submissionId={sub.id}
              versionId={latestVersion.id}
              currentPage={currentPage}
              onJumpToPage={(p) => setCurrentPage(p)}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History size={16} /> Riwayat Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l border-border pl-4">
                {(history ?? []).map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm font-medium">{h.status_baru}</p>
                    <p className="text-xs text-muted-foreground">
                      {(h as any).diubah_oleh_nama?.nama_lengkap} · {formatTanggal(h.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {bolehUploadVersi && (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-muted">
              <UploadCloud size={16} /> Unggah versi revisi
              <input type="file" className="hidden" />
            </label>
          )}
        </div>
      </div>

      <FinalisasiModal
        open={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        onConfirm={handleFinalisasi}
        pending={updateStatus.isPending}
      />
    </div>
  );
}
