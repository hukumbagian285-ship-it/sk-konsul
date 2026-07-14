import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";

export default function FinalisasiModal({
  open,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (nomorSk: string) => void;
  pending: boolean;
}) {
  const [nomorSk, setNomorSk] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><FileText size={16} /> Finalisasi SK</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X size={16} /></button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Masukkan nomor SK resmi untuk finalisasi dokumen ini.
        </p>
        <input
          className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Contoh: SK-BAGHUKUM/2026/001"
          value={nomorSk}
          onChange={(e) => setNomorSk(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Batal</Button>
          <Button size="sm" disabled={!nomorSk.trim() || pending} onClick={() => onConfirm(nomorSk.trim())}>
            {pending ? "Memproses..." : "Finalisasi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
