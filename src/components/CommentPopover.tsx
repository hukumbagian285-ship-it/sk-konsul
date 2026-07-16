import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { X, Send } from "lucide-react";

interface CommentPopoverProps {
  style: { top: number; left: number };
  onSubmit: (data: { warna: string; pasal: string | null; komentar: string }) => void;
  onCancel: () => void;
  pending: boolean;
}

const WARNA: { key: string; label: string; cls: string }[] = [
  { key: "merah", label: "Perlu diperbaiki", cls: "bg-red-500" },
  { key: "kuning", label: "Pertanyaan", cls: "bg-yellow-500" },
  { key: "hijau", label: "Saran", cls: "bg-green-500" },
];

export default function CommentPopover({ style, onSubmit, onCancel, pending }: CommentPopoverProps) {
  const [warna, setWarna] = useState("kuning");
  const [pasal, setPasal] = useState("");
  const [komentar, setKomentar] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel();
    }
    setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => document.removeEventListener("click", handleClick);
  }, [onCancel]);

  return (
    <div
      ref={ref}
      className="fixed z-50 w-72 rounded-lg border border-border bg-card p-3 shadow-lg"
      style={{ top: style.top, left: style.left }}
    >
      <button className="float-right rounded p-0.5 hover:bg-muted" onClick={onCancel}>
        <X size={14} />
      </button>

      <div className="mb-2 flex gap-1.5">
        {WARNA.map((w) => (
          <button
            key={w.key}
            className={`h-5 w-5 rounded-full border-2 ${w.cls} ${warna === w.key ? "border-foreground" : "border-transparent"}`}
            title={w.label}
            onClick={() => setWarna(w.key)}
          />
        ))}
      </div>

      <input
        className="mb-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        placeholder="Pasal (opsional)"
        value={pasal}
        onChange={(e) => setPasal(e.target.value)}
      />
      <Textarea
        placeholder="Tulis catatan perbaikan..."
        value={komentar}
        onChange={(e) => setKomentar(e.target.value)}
        className="mb-2 min-h-[60px] text-xs"
      />
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="outline" onClick={onCancel}>Batal</Button>
        <Button size="sm" disabled={!komentar.trim() || pending} onClick={() => onSubmit({ warna, pasal: pasal.trim() || null, komentar: komentar.trim() })}>
          <Send size={12} className="mr-1" /> Kirim
        </Button>
      </div>
    </div>
  );
}
