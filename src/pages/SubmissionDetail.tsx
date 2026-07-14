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
import { useSubmission, useVersions, useComments, useStatusHistory, useCreateComment, useUpdateStatus } from "@/lib/api";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: submission, isLoading } = useSubmission(id);
  const { data: versions } = useVersions(id);
  const { data: comments } = useComments(id);
  const { data: history } = useStatusHistory(id);
  const createComment = useCreateComment();
  const updateStatus = useUpdateStatus();

  const [komentarBaru, setKomentarBaru] = React.useState("");
  const [lokasiPasal, setLokasiPasal] = React.useState("");

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!submission || !user) {
    return <div className="text-center text-muted-foreground">Pengajuan tidak ditemukan. <Link to="/" className="text-primary underline">Kembali ke papan</Link></div>;
  }
  const sub = submission!;
  const usr = user!;

  const role = usr.role ?? "pemohon";
  const bolehKomentar = role === "staf_hukum" || role === "pimpinan" || role === "super_admin";
  const transisiTersedia = TRANSISI_SAH[role]?.[sub.status] ?? [];
  const bolehUploadVersi = (role === "pemohon" && sub.pemohon_id === usr.id) || role === "super_admin";

  async function handleTransisi(status: StatusSK) {
    await updateStatus.mutateAsync({ id: sub!.id, status });
  }

  async function handleKirimKomentar() {
    if (!komentarBaru.trim()) return;
    const latestVersion = (versions ?? [])[0];
    await createComment.mutateAsync({
      submission_id: sub!.id,
      version_id: latestVersion?.id ?? "",
      user_id: usr!.id,
      komentar: komentarBaru.trim(),
      lokasi_pasal: lokasiPasal.trim() || null,
    });
    setKomentarBaru("");
    setLokasiPasal("");
  }

  return (
    <div className="mx-auto max-w-4xl">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText size={16} /> Riwayat Versi Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(!versions || versions.length === 0) && (
                <p className="text-sm text-muted-foreground">Belum ada versi diunggah.</p>
              )}
              {(versions ?? []).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Versi {v.versi_ke}</p>
                    <p className="text-xs text-muted-foreground">{v.catatan_perubahan}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{formatTanggal(v.created_at)}</span>
                  </div>
                </div>
              ))}
              {bolehUploadVersi && (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-muted">
                  <UploadCloud size={16} /> Unggah versi revisi
                  <input type="file" className="hidden" />
                </label>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare size={16} /> Komentar Perbaikan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(!comments || comments.length === 0) && (
                <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
              )}
              {(comments ?? []).map((c) => (
                <div key={c.id} className="rounded-md border border-border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{(c as any).user_nama?.nama_lengkap}</span>
                    <span className="text-xs text-muted-foreground">{formatTanggal(c.created_at)}</span>
                  </div>
                  {c.lokasi_pasal && (
                    <Badge className="mb-1 border-primary/30 bg-blue-50 text-primary">{c.lokasi_pasal}</Badge>
                  )}
                  <p className="text-sm text-foreground">{c.komentar}</p>
                </div>
              ))}

              {bolehKomentar && (
                <div className="space-y-2 border-t border-border pt-3">
                  <input
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Lokasi pasal (contoh: Pasal 4 Ayat 2)"
                    value={lokasiPasal}
                    onChange={(e) => setLokasiPasal(e.target.value)}
                  />
                  <Textarea
                    placeholder="Tulis catatan perbaikan..."
                    value={komentarBaru}
                    onChange={(e) => setKomentarBaru(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" disabled={!komentarBaru.trim() || createComment.isPending} onClick={handleKirimKomentar}>
                      Kirim Komentar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
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
    </div>
  );
}
