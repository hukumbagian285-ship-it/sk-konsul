import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X as XIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/api";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useAllCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const [adding, setAdding] = React.useState(false);
  const [nama, setNama] = React.useState("");
  const [deskripsi, setDeskripsi] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editNama, setEditNama] = React.useState("");
  const [editDeskripsi, setEditDeskripsi] = React.useState("");

  async function handleAdd() {
    if (!nama.trim()) return;
    await create.mutateAsync({ nama_kategori: nama.trim(), deskripsi: deskripsi.trim() || null });
    setNama("");
    setDeskripsi("");
    setAdding(false);
  }

  async function handleEdit(id: string) {
    if (!editNama.trim()) return;
    await update.mutateAsync({ id, nama_kategori: editNama.trim(), deskripsi: editDeskripsi.trim() || null });
    setEditingId(null);
  }

  async function handleToggleActive(id: string, current: boolean) {
    await update.mutateAsync({ id, is_active: !current });
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">Kategori SK</h1>
          <p className="text-sm text-muted-foreground">Kelola jenis-jenis surat keputusan</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={16} /> Tambah
        </Button>
      </div>

      {adding && (
        <Card className="mb-4 border-primary/30">
          <CardContent className="space-y-3 pt-4">
            <Input placeholder="Nama kategori" value={nama} onChange={(e) => setNama(e.target.value)} autoFocus />
            <Textarea placeholder="Deskripsi (opsional)" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" disabled={!nama.trim() || create.isPending} onClick={handleAdd}>Simpan</Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNama(""); setDeskripsi(""); }}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {categories?.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Belum ada kategori.</p>
          )}
          {(categories ?? []).map((cat) => (
            <div key={cat.id} className="flex items-center justify-between gap-4 px-4 py-3">
              {editingId === cat.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input value={editNama} onChange={(e) => setEditNama(e.target.value)} className="h-8 text-sm" />
                  <Button size="sm" disabled={!editNama.trim()} onClick={() => handleEdit(cat.id)}>
                    <Check size={14} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <XIcon size={14} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{cat.nama_kategori}</p>
                    {cat.deskripsi && <p className="text-xs text-muted-foreground">{cat.deskripsi}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${cat.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditNama(cat.nama_kategori);
                        setEditDeskripsi(cat.deskripsi ?? "");
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(cat.id, cat.is_active)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                      title={cat.is_active ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {cat.is_active ? <XIcon size={14} /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={() => { if (confirm("Hapus kategori ini?")) del.mutate(cat.id); }}
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
