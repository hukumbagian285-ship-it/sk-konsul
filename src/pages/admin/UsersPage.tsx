import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X as XIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAllUsers, useCreateUser, useUpdateUser, useDeleteUser, useInstansi } from "@/lib/api";
import type { Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  pimpinan: "Pimpinan",
  staf_hukum: "Staf Hukum",
  pemohon: "Pemohon",
};

export default function UsersPage() {
  const { data: users, isLoading } = useAllUsers();
  const { data: instansi } = useInstansi();
  const create = useCreateUser();
  const update = useUpdateUser();
  const del = useDeleteUser();

  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({ nip: "", nama: "", role: "pemohon" as Role, instansi_id: "", password: "" });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ nama: "", role: "pemohon" as Role, instansi_id: "" });

  function resetForm() {
    setForm({ nip: "", nama: "", role: "pemohon", instansi_id: "", password: "" });
    setAdding(false);
  }

  async function handleAdd() {
    if (!form.nip.trim() || !form.nama.trim() || !form.password.trim()) return;
    await create.mutateAsync({
      nip: form.nip.trim(),
      nama_lengkap: form.nama.trim(),
      role: form.role,
      instansi_id: form.instansi_id || null,
      password: form.password,
    });
    resetForm();
  }

  async function handleEdit(id: string) {
    if (!editForm.nama.trim()) return;
    await update.mutateAsync({ id, nama_lengkap: editForm.nama.trim(), role: editForm.role, instansi_id: editForm.instansi_id || null });
    setEditingId(null);
  }

  if (isLoading) return <div className="flex flex-1 items-center justify-center"><Loader2 size={24} className="animate-spin" /></div>;

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 border-b border-border pb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Akun Pengguna</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola akun pengguna sistem</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={16} /> Tambah Akun
        </Button>
      </div>

      {adding && (
        <Card className="mb-6 border-accent/30">
          <CardContent className="space-y-3 pt-5">
            <Input placeholder="NIP" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} autoFocus />
            <Input placeholder="Nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="pemohon">Pemohon</option>
              <option value="staf_hukum">Staf Hukum</option>
              <option value="pimpinan">Pimpinan</option>
              <option value="super_admin">Super Admin</option>
            </Select>
            <Select value={form.instansi_id} onChange={(e) => setForm({ ...form, instansi_id: e.target.value })}>
              <option value="">Pilih instansi</option>
              {(instansi ?? []).map((i) => (
                <option key={i.id} value={i.id}>{i.nama_instansi}</option>
              ))}
            </Select>
            <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <div className="flex gap-2">
              <Button size="sm" disabled={!form.nip.trim() || !form.nama.trim() || !form.password.trim() || create.isPending} onClick={handleAdd}>
                Simpan
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* mobile card list */}
      <div className="space-y-2 md:hidden">
        {(users ?? []).map((u) => (
          <Card key={u.id}>
            <CardContent className="pt-5">
              {editingId === u.id ? (
                <div className="space-y-2">
                  <Input value={editForm.nama} onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })} className="h-8 text-sm" />
                  <Select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}>
                    {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Select>
                  <Select value={editForm.instansi_id} onChange={(e) => setEditForm({ ...editForm, instansi_id: e.target.value })}>
                    <option value="">Pilih instansi</option>
                    {(instansi ?? []).map((i) => <option key={i.id} value={i.id}>{i.nama_instansi}</option>)}
                  </Select>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => handleEdit(u.id)}><Check size={14} /> Simpan</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Batal</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{u.nama_lengkap}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">NIP: {u.nip}</p>
                    </div>
                    <span className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {ROLE_LABEL[u.role]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {u.instansi_nama?.nama_instansi ?? "—"}
                  </p>
                  <div className="mt-3 flex gap-1 border-t border-border pt-3">
                    <button onClick={() => { setEditingId(u.id); setEditForm({ nama: u.nama_lengkap, role: u.role, instansi_id: u.instansi_id ?? "" }); }}
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm(`Hapus ${u.nama_lengkap}?`)) del.mutate(u.id); }}
                      className="rounded p-1.5 text-destructive hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* desktop table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">NIP</th>
                <th className="px-5 py-3.5">Nama</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Instansi</th>
                <th className="px-5 py-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(users ?? []).map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-muted/30">
                  {editingId === u.id ? (
                    <>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground">{u.nip}</td>
                      <td className="px-5 py-2.5"><Input value={editForm.nama} onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })} className="h-8 text-sm" /></td>
                      <td className="px-5 py-2.5">
                        <Select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })} className="h-8 text-sm">
                          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </Select>
                      </td>
                      <td className="px-5 py-2.5">
                        <Select value={editForm.instansi_id} onChange={(e) => setEditForm({ ...editForm, instansi_id: e.target.value })} className="h-8 text-sm">
                          <option value="">—</option>
                          {(instansi ?? []).map((i) => <option key={i.id} value={i.id}>{i.nama_instansi}</option>)}
                        </Select>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleEdit(u.id)}><Check size={14} /></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><XIcon size={14} /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{u.nip}</td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">{u.nama_lengkap}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{u.instansi_nama?.nama_instansi ?? <span className="italic text-muted-foreground/50">—</span>}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingId(u.id); setEditForm({ nama: u.nama_lengkap, role: u.role, instansi_id: u.instansi_id ?? "" }); }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => { if (confirm(`Hapus ${u.nama_lengkap}?`)) del.mutate(u.id); }}
                            className="rounded p-1.5 text-destructive hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
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