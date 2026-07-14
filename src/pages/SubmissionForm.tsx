import * as React from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useCategories, useCreateVersion, useCreateAttachment } from "@/lib/api";
import { uploadViaGas } from "@/lib/gas-upload";

interface PendingFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function SubmissionForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const createVersion = useCreateVersion();
  const createAttachment = useCreateAttachment();

  const [judul, setJudul] = React.useState("");
  const [deskripsi, setDeskripsi] = React.useState("");
  const [kategoriId, setKategoriId] = React.useState("");
  const [instansiId] = React.useState(user?.instansi_id ?? "");
  const [draf, setDraf] = React.useState<PendingFile | null>(null);
  const [lampiran, setLampiran] = React.useState<PendingFile[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  function onPickDraf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setDraf({ file, status: "pending" });
  }

  function onPickLampiran(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setLampiran((prev) => [...prev, ...files.map((f) => ({ file: f, status: "pending" as const }))]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!judul.trim()) { setErrorMsg("Judul SK wajib diisi."); return; }
    if (!draf) { setErrorMsg("Draf SK wajib diunggah."); return; }
    if (!instansiId) { setErrorMsg("Akun Anda belum memiliki instansi. Hubungi super admin."); return; }
    if (!kategoriId) { setErrorMsg("Kategori wajib dipilih."); return; }
    if (!user) { setErrorMsg("Sesi login tidak ditemukan."); return; }

    setSubmitting(true);
    try {
      const { data: submission, error } = await supabase
        .from("sk_submissions")
        .insert({ judul_sk: judul.trim(), deskripsi: deskripsi.trim() || null, kategori_id: kategoriId, pemohon_id: user.id, instansi_id: instansiId })
        .select()
        .single();

      if (error || !submission) throw error;

      const folderPath = `${instansiId}/${submission.nomor_tiket}`;

      try {
        const gasResult = await uploadViaGas(draf.file, folderPath);
        await createVersion.mutateAsync({
          submission_id: submission.id,
          drive_file_id: gasResult.drive_file_id,
          catatan_perubahan: "Draf awal diajukan",
          diunggah_oleh: user.id,
        });
      } catch {
        setErrorMsg("Pengajuan tersimpan, tapi upload draf ke Drive gagal. Coba upload ulang nanti.");
      }

      for (const item of lampiran) {
        try {
          const r = await uploadViaGas(item.file, `${folderPath}/lampiran`);
          await createAttachment.mutateAsync({
            submission_id: submission.id,
            nama_file: r.nama_file,
            drive_file_id: r.drive_file_id,
            tipe_file: r.tipe_file,
            ukuran_bytes: r.ukuran_bytes,
            diunggah_oleh: user.id,
          });
        } catch {
        }
      }

      navigate("/");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Terjadi kesalahan saat menyimpan pengajuan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-2xl font-semibold text-foreground">Ajukan SK Baru</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Nomor tiket akan dibuat otomatis oleh sistem setelah pengajuan disimpan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informasi SK</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kategori</label>
              <Select value={kategoriId} onChange={(e) => setKategoriId(e.target.value)} required>
                <option value="">Pilih kategori</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Judul SK</label>
              <Input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: SK Tim Percepatan Penurunan Stunting" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Deskripsi (opsional)</label>
              <Textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Ringkasan singkat maksud dan tujuan SK ini" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Draf SK</CardTitle></CardHeader>
          <CardContent>
            {draf ? (
              <div className="flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2 text-sm">
                <span className="flex items-center gap-2"><FileText size={16} />{draf.file.name}</span>
                <button type="button" onClick={() => setDraf(null)} aria-label="Hapus draf"><X size={16} /></button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-center hover:bg-muted">
                <UploadCloud size={22} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Klik untuk unggah draf (.docx, .pdf) — maks 20 MB</span>
                <input type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onPickDraf} className="hidden" />
              </label>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lampiran Pendukung (opsional)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lampiran.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2 text-sm">
                <span className="flex items-center gap-2"><FileText size={16} />{item.file.name}</span>
                <button type="button" onClick={() => setLampiran((prev) => prev.filter((_, i) => i !== idx))} aria-label="Hapus lampiran"><X size={16} /></button>
              </div>
            ))}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border py-4 text-sm text-muted-foreground hover:bg-muted">
              <UploadCloud size={16} /> Tambah lampiran
              <input type="file" multiple onChange={onPickLampiran} className="hidden" />
            </label>
          </CardContent>
        </Card>

        {errorMsg && (
          <p className="rounded-md border border-warning/30 bg-amber-50 px-3 py-2 text-sm text-warning">{errorMsg}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>Batal</Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Simpan Pengajuan
          </Button>
        </div>
      </form>
    </div>
  );
}
