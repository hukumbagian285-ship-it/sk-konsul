import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, History, UploadCloud, Loader2, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_WARNA, TRANSISI_SAH, type StatusSK } from "@/lib/types";
import { formatTanggal, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useSubmission, useVersions, useStatusHistory, useUpdateStatus, useCreateVersion, useComments, useCreateComment } from "@/lib/api";
import { uploadViaGas } from "@/lib/gas-upload";
import PdfViewer from "@/components/PdfViewer";
import CommentModal from "@/components/CommentModal";
import CommentPopover from "@/components/CommentPopover";
import FinalisasiModal from "@/components/FinalisasiModal";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: submission, isLoading } = useSubmission(id);
  const { data: versions } = useVersions(id);
  const { data: history } = useStatusHistory(id);
  const updateStatus = useUpdateStatus();

  const createVersion = useCreateVersion();
  const { data: comments = [] } = useComments(id);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "error" | "done">("idle");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ page: number; x: number; y: number; w: number; h: number } | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  const createComment = useCreateComment();

  if (isLoading) return <div className="flex flex-1 items-center justify-center"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!submission || !user) {
    return <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">Pengajuan tidak ditemukan. <Link to="/" className="text-primary underline">Kembali ke papan</Link></div>;
  }
  const sub = submission!;
  const usr = user!;

  const role = usr.role ?? "pemohon";
  const bolehLihatKomentar = !!id;
  const transisiTersedia = TRANSISI_SAH[role]?.[sub.status] ?? [];
  const bolehUploadVersi = (role === "pemohon" && sub.pemohon_id === usr.id) || role === "super_admin";
  const latestVersion = (versions ?? [])[0];

  function handleTransisi(status: StatusSK) {
    if (status === "Finalisasi") {
      setShowFinalModal(true);
      return;
    }
    updateStatus.mutateAsync({ id: sub!.id, status });
  }

  async function handleFinalisasi(nomorSk: string) {
    await updateStatus.mutateAsync({ id: sub!.id, status: "Finalisasi" as StatusSK });
    await supabase.from("sk_submissions").update({ nomor_sk: nomorSk }).eq("id", sub!.id);
    setShowFinalModal(false);
  }

  function onJumpToPage(page: number) {
    setCurrentPage(page);
    setHighlightedCommentId(null);
  }

  function handleSubmitAnnotation(data: { warna: string; pasal: string | null; komentar: string }) {
    if (!selectedPosition || !id || !user) return;
    createComment.mutate(
      {
        submission_id: id,
        version_id: latestVersion?.id ?? "",
        komentar: data.komentar,
        lokasi_pasal: data.pasal,
        warna: data.warna,
        halaman: selectedPosition.page,
        pos_x: selectedPosition.x,
        pos_y: selectedPosition.y,
        lebar: selectedPosition.w,
        tinggi: selectedPosition.h,
        user_id: user.id,
      },
      { onSuccess: () => setSelectedPosition(null) },
    );
  }

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col min-h-0 mx-auto">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Kembali ke papan
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 flex-shrink-0">
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

      {transisiTersedia.length > 0 && (
        <Card className="mb-4 border-primary/30 flex-shrink-0">
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

      <div className="flex flex-1 flex-col gap-6 min-h-0 pb-6 lg:flex-row">
        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader className="flex-shrink-0 flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText size={16} /> Dokumen</CardTitle>
            {bolehLihatKomentar && (
              <button onClick={() => setShowComments(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <MessageSquare size={14} /> Komentar
              </button>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 min-h-0 flex-col p-0">
            {latestVersion ? (
              <PdfViewer
                driveFileId={latestVersion.drive_file_id}
                comments={comments}
                annotationMode={annotationMode}
                onToggleAnnotation={() => setAnnotationMode((a) => !a)}
                selectedPosition={selectedPosition}
                onSelectPosition={setSelectedPosition}
                onCommentClick={(commentId) => {
                  const c = comments.find((x) => x.id === commentId);
                  if (c?.halaman) setCurrentPage(c.halaman);
                  setHighlightedCommentId(commentId);
                }}
                onPageChange={setCurrentPage}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">Belum ada dokumen.</p>
              </div>
            )}
            {selectedPosition?.page === currentPage && (
              <CommentPopover
                style={{
                  top: selectedPosition.y + 60,
                  left: selectedPosition.x + 20,
                }}
                onSubmit={handleSubmitAnnotation}
                onCancel={() => setSelectedPosition(null)}
                pending={createComment.isPending}
              />
            )}
          </CardContent>
        </Card>

        <div className="w-full flex-shrink-0 space-y-6 overflow-y-auto lg:w-[380px]">
          {bolehUploadVersi && (
            <Card>
              <CardContent className="p-4">
                {uploadStatus === "done" ? (
                  <p className="flex items-center gap-2 text-sm text-accent"><CheckCircle size={16} /> Dokumen berhasil diunggah</p>
                ) : (
                  <>
                    <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed py-3 text-sm hover:bg-muted ${uploadStatus === "error" ? "border-warning text-warning" : "border-border text-muted-foreground"}`}>
                      <UploadCloud size={16} /> {uploading ? "Mengunggah..." : "Unggah versi revisi"}
                      <input
                        type="file"
                        accept=".docx,.pdf"
                        className="hidden"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !sub) return;
                          setUploading(true);
                          setUploadStatus("idle");
                          try {
                            const instansiName = (sub as any).instansi_nama?.nama_instansi ?? sub.instansi_id ?? "unknown";
                            const folderPath = `${instansiName}/${sub.nomor_tiket}`;
                            const gasResult = await uploadViaGas(file, folderPath);
                            await createVersion.mutateAsync({
                              submission_id: sub.id,
                              drive_file_id: gasResult.drive_file_id,
                              catatan_perubahan: "Upload dari detail",
                              diunggah_oleh: usr.id,
                            });
                            setUploadStatus("done");
                          } catch {
                            setUploadStatus("error");
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </label>
                    {uploadStatus === "error" && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-warning"><AlertCircle size={12} /> Upload gagal. Coba lagi.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
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
        </div>
      </div>

      <CommentModal
        open={showComments}
        onClose={() => setShowComments(false)}
        submissionId={sub.id}
        onJumpToPage={onJumpToPage}
        highlightedCommentId={highlightedCommentId ?? undefined}
      />

      <FinalisasiModal
        open={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        onConfirm={handleFinalisasi}
        pending={updateStatus.isPending}
      />
    </div>
  );
}
