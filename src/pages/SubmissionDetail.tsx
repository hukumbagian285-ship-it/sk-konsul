import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, History, UploadCloud, Loader2, CheckCircle, AlertCircle, MessageSquare, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_WARNA, TRANSISI_SAH, type StatusSK } from "@/lib/types";
import { formatTanggal, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useSubmission, useVersions, useStatusHistory, useUpdateStatus, useCreateVersion, useComments, useCreateComment, useUpdateComment } from "@/lib/api";
import { uploadViaGas } from "@/lib/gas-upload";
import PdfViewer from "@/components/PdfViewer";
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editLokasiPasal, setEditLokasiPasal] = useState("");

  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const getPopoverStyle = useCallback(() => {
    if (!selectedPosition || selectedPosition.page !== currentPage) return null;
    const pageEl = document.querySelector(`[data-page-number="${currentPage}"]`);
    if (!pageEl) return null;
    const r = pageEl.getBoundingClientRect();
    return {
      top: r.top + (selectedPosition.y / 100) * r.height,
      left: r.left + (selectedPosition.x / 100) * r.width + 10,
    };
  }, [selectedPosition, currentPage]);

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
                style={getPopoverStyle() ?? { top: 0, left: 0 }}
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

          {bolehLihatKomentar && comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare size={16} /> Komentar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-md border border-border p-3">
                    {editingCommentId === c.id ? (
                      <>
                        <div className="mb-2 flex items-center gap-2">
                          <input
                            className="flex-1 rounded border border-border bg-transparent px-2 py-1 text-xs"
                            placeholder="Lokasi pasal (opsional)"
                            value={editLokasiPasal}
                            onChange={(e) => setEditLokasiPasal(e.target.value)}
                          />
                          {c.halaman && (
                            <Badge className="border-primary/30 bg-blue-50 text-[10px] text-primary shrink-0">Hal. {c.halaman}</Badge>
                          )}
                        </div>
                        <textarea
                          className="mb-2 w-full rounded border border-border bg-transparent px-2 py-1 text-xs resize-none"
                          rows={3}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors"
                            onClick={() => {
                              updateComment.mutate({ id: c.id, komentar: editText, lokasi_pasal: editLokasiPasal || null });
                              setEditingCommentId(null);
                            }}
                            disabled={updateComment.isPending}
                          ><Check size={14} /></button>
                          <button
                            className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors"
                            onClick={() => setEditingCommentId(null)}
                          ><X size={14} /></button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            {c.warna && <span className={`inline-block h-2 w-2 rounded-full ${{ merah: "bg-red-500", kuning: "bg-yellow-500", hijau: "bg-green-500" }[c.warna] ?? "bg-gray-400"}`} />}
                            {(c as any).user_nama?.nama_lengkap}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">{formatTanggal(c.created_at)}</span>
                            {c.user_id === user?.id && (
                              <button
                                className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors"
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditText(c.komentar);
                                  setEditLokasiPasal(c.lokasi_pasal ?? "");
                                }}
                              ><Pencil size={12} /></button>
                            )}
                          </div>
                        </div>
                        <div className="mb-1 flex gap-1 flex-wrap">
                          {c.halaman && (
                            <Badge className="border-primary/30 bg-blue-50 text-[10px] text-primary">Hal. {c.halaman}</Badge>
                          )}
                          {c.lokasi_pasal && (
                            <Badge className="border-accent/30 bg-emerald-50 text-[10px] text-accent">{c.lokasi_pasal}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground">{c.komentar}</p>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
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