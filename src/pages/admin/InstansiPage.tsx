import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X as XIcon, Building2 } from "lucide-react";
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

  if (isLoading) return <div className="flex flex-1 items-center justify-center"><Loader2 size={24} className="animate-spin" /></div>;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8 border-b border-border pb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Instansi / OPD</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola daftar perangkat daerah</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={16} /> Tambah
        </Button>
      </div>

      {adding && (
        <Card className="mb-6 border-accent/30">
          <CardContent className="space-y-3 pt-5">
            <Input placeholder="Kode (contoh: DISKOMINFO)" value={kode} onChange={(e) => setKode(e.target.value)} autoFocus />
            <Input placeholder="Nama instansi" value={nama} onChange={(e) => setNama(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" disabled={!kode.trim() || !nama.trim() || create.isPending} onClick={handleAdd}>Simpan</Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setKode(""); setNama(""); }}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* mobile card list */}
      <div className="divide-y divide-border rounded-lg border md:hidden">
        {instansi?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Building2 size={32} className="text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Belum ada instansi.</p>
          </div>
        )}
        {(instansi ?? []).map((i) => (
          <div key={i.id} className="flex items-center justify-between gap-4 px-4 py-3">
            {editingId === i.id ? (
              <div className="flex flex-1 items-center gap-2">
                <Input value={editKode} onChange={(e) => setEditKode(e.target.value)} className="h-8 w-32 text-sm" />
                <Input value={editNama} onChange={(e) => setEditNama(e.target.value)} className="h-8 flex-1 text-sm" />
                <Button size="sm" disabled={!editKode.trim() || !editNama.trim()} onClick={() => handleEdit(i.id)}><Check size={14} /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><XIcon size={14} /></Button>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{i.nama_instansi}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Kode: {i.kode_instansi}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingId(i.id); setEditKode(i.kode_instansi); setEditNama(i.nama_instansi); }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm(`Hapus ${i.nama_instansi}?`)) del.mutate(i.id); }}
                    className="rounded p-1.5 text-destructive hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={14} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* desktop table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Kode</th>
                <th className="px-5 py-3.5">Nama Instansi</th>
                <th className="px-5 py-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(instansi ?? []).map((i) => (
                <tr key={i.id} className="transition-colors hover:bg-muted/30">
                  {editingId === i.id ? (
                    <>
                      <td className="px-5 py-2.5"><Input value={editKode} onChange={(e) => setEditKode(e.target.value)} className="h-8 w-28 text-sm" /></td>
                      <td className="px-5 py-2.5"><Input value={editNama} onChange={(e) => setEditNama(e.target.value)} className="h-8 text-sm" /></td>
                      <td className="px-5 py-2.5">
                        <div className="flex gap-1">
                          <Button size="sm" disabled={!editKode.trim() || !editNama.trim()} onClick={() => handleEdit(i.id)}><Check size={14} /></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><XIcon size={14} /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 font-mono text-xs font-medium uppercase text-muted-foreground">{i.kode_instansi}</td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">{i.nama_instansi}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingId(i.id); setEditKode(i.kode_instansi); setEditNama(i.nama_instansi); }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Edit"><Pencil size={14} /></button>
                          <button onClick={() => { if (confirm(`Hapus ${i.nama_instansi}?`)) del.mutate(i.id); }}
                            className="rounded p-1.5 text-destructive hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
