import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X as XIcon, FolderKanban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/api";
import { toast } from "@/components/Toast";

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
    try {
      await create.mutateAsync({ nama_kategori: nama.trim(), deskripsi: deskripsi.trim() || null });
      toast("Kategori berhasil ditambahkan", "success");
      setNama(""); setDeskripsi(""); setAdding(false);
    } catch { toast("Gagal menambahkan kategori", "error"); }
  }

  async function handleEdit(id: string) {
    if (!editNama.trim()) return;
    try {
      await update.mutateAsync({ id, nama_kategori: editNama.trim(), deskripsi: editDeskripsi.trim() || null });
      toast("Kategori berhasil diperbarui", "success");
      setEditingId(null);
    } catch { toast("Gagal memperbarui kategori", "error"); }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await update.mutateAsync({ id, is_active: !current });
      toast(current ? "Kategori dinonaktifkan" : "Kategori diaktifkan", "success");
    } catch { toast("Gagal mengubah status kategori", "error"); }
  }

  async function handleDelete(id: string) {
    try {
      await del.mutateAsync(id);
      toast("Kategori berhasil dihapus", "success");
    } catch { toast("Gagal menghapus kategori", "error"); }
  }

  if (isLoading) return <div className="flex flex-1 items-center justify-center"><Loader2 size={24} className="animate-spin" /></div>;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8 border-b border-border pb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Kategori SK</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola jenis-jenis surat keputusan</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={16} /> Tambah
        </Button>
      </div>

      {adding && (
        <Card className="mb-6 border-accent/30">
          <CardContent className="space-y-3 pt-5">
            <Input placeholder="Nama kategori" value={nama} onChange={(e) => setNama(e.target.value)} autoFocus />
            <Textarea placeholder="Deskripsi (opsional)" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" disabled={!nama.trim() || create.isPending} onClick={handleAdd}>Simpan</Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNama(""); setDeskripsi(""); }}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* mobile card list */}
      <div className="divide-y divide-border rounded-lg border md:hidden">
        {categories?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderKanban size={32} className="text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Belum ada kategori.</p>
          </div>
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
                  <p className="text-sm font-semibold text-foreground">{cat.nama_kategori}</p>
                  {cat.deskripsi && <p className="mt-0.5 text-xs text-muted-foreground">{cat.deskripsi}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${cat.is_active ? "bg-accent" : "bg-slate-300"}`} />
                  <button onClick={() => { setEditingId(cat.id); setEditNama(cat.nama_kategori); setEditDeskripsi(cat.deskripsi ?? ""); }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => handleToggleActive(cat.id, cat.is_active)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors" title={cat.is_active ? "Nonaktifkan" : "Aktifkan"}>
                    {cat.is_active ? <XIcon size={14} /> : <Check size={14} />}
                  </button>
                  <button onClick={() => { if (confirm("Hapus kategori ini?")) handleDelete(cat.id); }}
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
                <th className="px-5 py-3.5">Nama Kategori</th>
                <th className="px-5 py-3.5">Deskripsi</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(categories ?? []).map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-muted/30">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-5 py-2.5"><Input value={editNama} onChange={(e) => setEditNama(e.target.value)} className="h-8 text-sm" /></td>
                      <td className="px-5 py-2.5" colSpan={2}><Input value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} className="h-8 text-sm" placeholder="Deskripsi" /></td>
                      <td className="px-5 py-2.5">
                        <div className="flex gap-1">
                          <Button size="sm" disabled={!editNama.trim()} onClick={() => handleEdit(cat.id)}><Check size={14} /></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><XIcon size={14} /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 font-semibold text-foreground">{cat.nama_kategori}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{cat.deskripsi ?? <span className="italic text-muted-foreground/50">—</span>}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cat.is_active ? "text-accent" : "text-slate-400"}`}>
                          <span className={`inline-block h-2 w-2 rounded-full ${cat.is_active ? "bg-accent" : "bg-slate-300"}`} />
                          {cat.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingId(cat.id); setEditNama(cat.nama_kategori); setEditDeskripsi(cat.deskripsi ?? ""); }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Edit"><Pencil size={14} /></button>
                          <button onClick={() => handleToggleActive(cat.id, cat.is_active)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors" title={cat.is_active ? "Nonaktifkan" : "Aktifkan"}>
                            {cat.is_active ? <XIcon size={14} /> : <Check size={14} />}
                          </button>
                          <button onClick={() => { if (confirm("Hapus kategori ini?")) handleDelete(cat.id); }}
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