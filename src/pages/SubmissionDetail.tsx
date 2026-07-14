import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, MessageSquare, History, Download, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  MOCK_SUBMISSIONS,
  MOCK_VERSIONS,
  MOCK_COMMENTS,
  MOCK_STATUS_HISTORY,
} from "@/lib/mock-data";
import { STATUS_WARNA, TRANSISI_SAH, type StatusSK } from "@/lib/types";
import { formatTanggal, cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [komentarBaru, setKomentarBaru] = React.useState("");
  const [lokasiPasal, setLokasiPasal] = React.useState("");
  const [status, setStatus] = React.useState<StatusSK>(
    (MOCK_SUBMISSIONS.find((s) => s.id === id)?.status ?? "Draft Masuk") as StatusSK
  );

  const submission = MOCK_SUBMISSIONS.find((s) => s.id === id);
  const versions = MOCK_VERSIONS.filter((v) => v.submission_id === id);
  const comments = MOCK_COMMENTS.filter((c) => c.submission_id === id);
  const history = MOCK_STATUS_HISTORY.filter((h) => h.submission_id === id);

  if (!submission) {
    return (
      <div className="text-center text-muted-foreground">
        Pengajuan tidak ditemukan.{" "}
        <Link to="/" className="text-primary underline">
          Kembali ke papan
        </Link>
      </div>
    );
  }

  // Boleh komentar? sesuai matrix 4.1
  const bolehKomentar = user.role === "staf_hukum" || user.role === "pimpinan" || user.role === "super_admin";
  // Transisi status yang sah untuk role ini dari status saat ini (matrix 4.2)
  const transisiTersedia = TRANSISI_SAH[user.role]?.[status] ?? [];
  // Pemohon boleh upload versi revisi hanya milik sendiri (di sini semua mock milik demo-pemohon)
  const bolehUploadVersi =
    (user.role === "pemohon" && submission.pemohon_id === user.id) || user.role === "super_admin";

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} />
        Kembali ke papan
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ticket-tag mb-1">{submission.nomor_tiket}</p>
          <h1 className="font-display text-2xl font-semibold text-foreground">{submission.judul_sk}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {submission.instansi_nama} · {submission.kategori_nama}
          </p>
        </div>
        <Badge className={cn("border px-3 py-1 text-sm", STATUS_WARNA[status])}>{status}</Badge>
      </div>

      {submission.deskripsi && (
        <p className="mb-6 rounded-md border border-border bg-muted p-3 text-sm text-foreground">
          {submission.deskripsi}
        </p>
      )}

      {transisiTersedia.length > 0 && (
        <Card className="mb-6 border-primary/30">
          <CardContent className="flex flex-wrap items-center gap-2 p-4">
            <span className="text-sm font-medium text-foreground">Aksi:</span>
            {transisiTersedia.map((next) => (
              <Button key={next} size="sm" variant={next === "Revisi Pemohon" ? "outline" : "default"} onClick={() => setStatus(next)}>
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
              <CardTitle className="flex items-center gap-2">
                <FileText size={16} /> Riwayat Versi Dokumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {versions.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada versi diunggah.</p>
              )}
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">Versi {v.versi_ke}</p>
                    <p className="text-xs text-muted-foreground">{v.catatan_perubahan}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{formatTanggal(v.created_at)}</span>
                    <Button size="sm" variant="ghost">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {bolehUploadVersi && (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-muted">
                  <UploadCloud size={16} />
                  Unggah versi revisi
                  <input type="file" className="hidden" />
                </label>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={16} /> Komentar Perbaikan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="rounded-md border border-border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{c.user_nama}</span>
                    <span className="text-xs text-muted-foreground">{formatTanggal(c.created_at)}</span>
                  </div>
                  {c.lokasi_pasal && (
                    <Badge className="mb-1 border-primary/30 bg-blue-50 text-primary">
                      {c.lokasi_pasal}
                    </Badge>
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
                    <Button
                      size="sm"
                      disabled={!komentarBaru.trim()}
                      onClick={() => {
                        setKomentarBaru("");
                        setLokasiPasal("");
                      }}
                    >
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
              <CardTitle className="flex items-center gap-2">
                <History size={16} /> Riwayat Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l border-border pl-4">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm font-medium">{h.status_baru}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.diubah_oleh_nama} · {formatTanggal(h.created_at)}
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
