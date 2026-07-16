import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X as XIcon, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "@/lib/api";

export default function AdminTemplatePage() {
  const { data: templates, isLoading } = useTemplates();
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const del = useDeleteTemplate();

  const [adding, setAdding] = React.useState(false);
  const [nama, setNama] = React.useState("");
  const [deskripsi, setDeskripsi] = React.useState("");
  const [driveFileId, setDriveFileId] = React.useState("");
  const [aturan, setAturan] = React.useState("");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editNama, setEditNama] = React.useState("");
  const [editDeskripsi, setEditDeskripsi] = React.useState("");
  const [editDriveFileId, setEditDriveFileId] = React.useState("");
  const [editAturan, setEditAturan] = React.useState("");

  async function handleAdd() {
    if (!nama.trim() || !driveFileId.trim()) return;
    await create.mutateAsync({
      nama_template: nama.trim(),
      deskripsi: deskripsi.trim() || null,
      drive_file_id: driveFileId.trim(),
      aturan_penulisan: aturan.trim() || null,
    });
    setNama(""); setDeskripsi(""); setDriveFileId(""); setAturan("");
    setAdding(false);
  }

  async function handleEdit(id: string) {
    if (!editNama.trim() || !editDriveFileId.trim()) return;
    await update.mutateAsync({
      id,
      nama_template: editNama.trim(),
      deskripsi: editDeskripsi.trim() || null,
      drive_file_id: editDriveFileId.trim(),
      aturan_penulisan: editAturan.trim() || null,
    });
    setEditingId(null);
  }

  if (isLoading) return <div className="flex flex-1 items-center justify-center"><Loader2 size={24} className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">Template Dokumen</h1>
          <p className="text-sm text-muted-foreground">Kelola template dokumen SK</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={16} /> Tambah
        </Button>
      </div>

      {adding && (
        <Card className="mb-4 border-primary/30">
          <CardContent className="space-y-3 pt-4">
            <Input placeholder="Nama template (e.g. NODIS, SK)" value={nama} onChange={(e) => setNama(e.target.value)} autoFocus />
            <Input placeholder="Deskripsi (opsional)" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
            <Input placeholder="Google Drive File ID" value={driveFileId} onChange={(e) => setDriveFileId(e.target.value)} />
            <Textarea placeholder="Aturan penulisan (opsional)" value={aturan} onChange={(e) => setAturan(e.target.value)} rows={4} />
            <div className="flex gap-2">
              <Button size="sm" disabled={!nama.trim() || !driveFileId.trim() || create.isPending} onClick={handleAdd}>Simpan</Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNama(""); setDeskripsi(""); setDriveFileId(""); setAturan(""); }}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {templates?.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Belum ada template.</p>
          )}
          {(templates ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
              {editingId === t.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <Input value={editNama} onChange={(e) => setEditNama(e.target.value)} className="h-8 text-sm" />
                  <Input value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} className="h-8 text-sm" placeholder="Deskripsi" />
                  <Input value={editDriveFileId} onChange={(e) => setEditDriveFileId(e.target.value)} className="h-8 text-sm" placeholder="Drive File ID" />
                  <Textarea value={editAturan} onChange={(e) => setEditAturan(e.target.value)} className="text-sm" rows={3} placeholder="Aturan penulisan" />
                  <div className="flex gap-1">
                    <Button size="sm" disabled={!editNama.trim() || !editDriveFileId.trim()} onClick={() => handleEdit(t.id)}>
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <XIcon size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-muted-foreground shrink-0" />
                      <p className="text-sm font-medium text-foreground">{t.nama_template}</p>
                    </div>
                    {t.deskripsi && <p className="mt-0.5 text-xs text-muted-foreground">{t.deskripsi}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(t.id);
                        setEditNama(t.nama_template);
                        setEditDeskripsi(t.deskripsi ?? "");
                        setEditDriveFileId(t.drive_file_id);
                        setEditAturan(t.aturan_penulisan ?? "");
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => { if (confirm("Hapus template ini?")) del.mutate(t.id); }}
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
