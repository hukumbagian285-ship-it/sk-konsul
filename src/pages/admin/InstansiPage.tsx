import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X as XIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInstansi, useCreateInstansi, useUpdateInstansi, useDeleteInstansi } from "@/lib/api";

export default function InstansiPage() {
  const { data: instansi, isLoading } = useInstansi();
  const create = useCreateInstansi();
  const update = useUpdateInstansi();
  const del = useDeleteInstansi();

  const [adding, setAdding] = React.useState(false);
  const [kode, setKode] = React.useState("");
  const [nama, setNama] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editKode, setEditKode] = React.useState("");
  const [editNama, setEditNama] = React.useState("");

  async function handleAdd() {
    if (!kode.trim() || !nama.trim()) return;
    await create.mutateAsync({ kode_instansi: kode.trim().toUpperCase(), nama_instansi: nama.trim() });
    setKode("");
    setNama("");
    setAdding(false);
  }

  async function handleEdit(id: string) {
    if (!editKode.trim() || !editNama.trim()) return;
    await update.mutateAsync({ id, kode_instansi: editKode.trim().toUpperCase(), nama_instansi: editNama.trim() });
    setEditingId(null);
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">Instansi / OPD</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar perangkat daerah</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={16} /> Tambah
        </Button>
      </div>

      {adding && (
        <Card className="mb-4 border-primary/30">
          <CardContent className="space-y-3 pt-4">
            <Input placeholder="Kode (contoh: DISKOMINFO)" value={kode} onChange={(e) => setKode(e.target.value)} autoFocus />
            <Input placeholder="Nama instansi" value={nama} onChange={(e) => setNama(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" disabled={!kode.trim() || !nama.trim() || create.isPending} onClick={handleAdd}>Simpan</Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setKode(""); setNama(""); }}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {instansi?.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Belum ada instansi.</p>
          )}
          {(instansi ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-4 px-4 py-3">
              {editingId === i.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input value={editKode} onChange={(e) => setEditKode(e.target.value)} className="h-8 w-32 text-sm" />
                  <Input value={editNama} onChange={(e) => setEditNama(e.target.value)} className="h-8 flex-1 text-sm" />
                  <Button size="sm" disabled={!editKode.trim() || !editNama.trim()} onClick={() => handleEdit(i.id)}>
                    <Check size={14} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <XIcon size={14} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{i.nama_instansi}</p>
                    <p className="text-xs text-muted-foreground">Kode: {i.kode_instansi}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(i.id); setEditKode(i.kode_instansi); setEditNama(i.nama_instansi); }}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Hapus ${i.nama_instansi}?`)) del.mutate(i.id); }}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
