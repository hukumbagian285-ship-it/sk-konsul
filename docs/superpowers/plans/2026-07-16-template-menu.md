# Template Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "Template" menu showing Google Drive .docx templates with formatting rules.

**Architecture:** New `sk_templates` table → API hooks → 3 new pages (list, detail, admin CRUD) → nav + route wiring

**Tech Stack:** Supabase, TanStack Query, React Router, shadcn/ui, Google Docs embed

## Global Constraints

- All new pages follow existing patterns (Card, Button, Input from shadcn/ui)
- Admin CRUD matches CategoriesPage.tsx pattern (inline edit, no modal)
- Template preview uses Google Docs embed iframe
- Markdown rendering for aturan_penulisan — use simple `<pre>` or `<div>` with whitespace, no markdown lib
- Table name: `sk_templates`
- All users can view templates; only super_admin can CRUD

---

### Task 1: Supabase Migration — Create sk_templates table + RLS

**Files:**
- Modify: Supabase project via apply_migration

**Interfaces:**
- Consumes: nothing
- Produces: `sk_templates` table with RLS (SELECT for all authenticated, INSERT/UPDATE/DELETE for super_admin)

- [ ] **Run migration SQL**

SQL to apply:
```sql
CREATE TABLE sk_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_template VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  drive_file_id TEXT NOT NULL,
  aturan_penulisan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sk_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates dapat dilihat semua authenticated"
  ON sk_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Templates dapat dikelola super_admin"
  ON sk_templates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  ));
```

---

### Task 2: Types + API Hooks

**Files:**
- Modify: `src/lib/types.ts` — add `SkTemplate` interface
- Modify: `src/lib/api.ts` — add template hooks

**Interfaces:**
- Consumes: `supabase` from `@/lib/supabase`
- Produces: `SkTemplate` type, `useTemplates()`, `useTemplate(id)`, `useCreateTemplate()`, `useUpdateTemplate()`, `useDeleteTemplate()`

- [ ] **Add SkTemplate type to types.ts**

Insert after `SkStatusHistory` interface:
```typescript
export interface SkTemplate {
  id: string;
  nama_template: string;
  deskripsi: string | null;
  drive_file_id: string;
  aturan_penulisan: string | null;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Add import and template hooks to api.ts**

Add `SkTemplate` to the import from types:
```typescript
import type { ..., SkTemplate } from "@/lib/types";
```

Add after the `useAllCategories` hook (before EOF):
```typescript
export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data } = await supabase.from("sk_templates").select("*").order("nama_template");
      return (data ?? []) as SkTemplate[];
    },
  });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const { data } = await supabase.from("sk_templates").select("*").eq("id", id).single();
      return data as SkTemplate | null;
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nama_template: string; deskripsi: string | null; drive_file_id: string; aturan_penulisan: string | null }) => {
      const { data, error } = await supabase.from("sk_templates").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nama_template?: string; deskripsi?: string | null; drive_file_id?: string; aturan_penulisan?: string | null }) => {
      const { data, error } = await supabase.from("sk_templates").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sk_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}
```

---

### Task 3: Template List Page

**Files:**
- Create: `src/pages/TemplateListPage.tsx`

**Interfaces:**
- Consumes: `useTemplates()` from api
- Produces: Route at `/templates`

- [ ] **Create TemplateListPage.tsx**

```typescript
import { Link } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTemplates } from "@/lib/api";

export default function TemplateListPage() {
  const { data: templates, isLoading } = useTemplates();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-foreground">Template Dokumen</h1>
        <p className="text-sm text-muted-foreground">Panduan format dan contoh dokumen SK</p>
      </div>

      {templates?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Belum ada template.</p>
      )}

      <div className="space-y-3">
        {(templates ?? []).map((t) => (
          <Link key={t.id} to={`/templates/${t.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.nama_template}</p>
                  {t.deskripsi && <p className="text-xs text-muted-foreground">{t.deskripsi}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 4: Template Detail Page (Preview + Rules)

**Files:**
- Create: `src/pages/TemplateDetailPage.tsx`

**Interfaces:**
- Consumes: `useTemplate(id)` from api
- Produces: Route at `/templates/:id`

- [ ] **Create TemplateDetailPage.tsx**

```typescript
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplate } from "@/lib/api";

export default function TemplateDetailPage() {
  const { id } = useParams();
  const { data: template, isLoading } = useTemplate(id);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!template) return <div className="text-center text-muted-foreground">Template tidak ditemukan.</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/templates" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Kembali ke daftar template
      </Link>

      <h1 className="mb-1 font-display text-2xl font-semibold text-foreground">{template.nama_template}</h1>
      {template.deskripsi && <p className="mb-6 text-sm text-muted-foreground">{template.deskripsi}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Pratinjau Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-[4/3] w-full">
              <iframe
                src={`https://docs.google.com/document/d/${template.drive_file_id}/preview`}
                className="h-full w-full rounded-b-lg border-0"
                title="Pratinjau dokumen"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Aturan Penulisan</CardTitle>
          </CardHeader>
          <CardContent>
            {template.aturan_penulisan ? (
              <div className="whitespace-pre-wrap text-sm text-foreground">{template.aturan_penulisan}</div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada aturan penulisan.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <a
        href={`https://docs.google.com/document/d/${template.drive_file_id}/edit`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ExternalLink size={14} /> Buka di Google Docs
      </a>
    </div>
  );
}
```

---

### Task 5: Admin Template CRUD Page

**Files:**
- Create: `src/pages/admin/AdminTemplatePage.tsx`

**Interfaces:**
- Consumes: `useTemplates(), useCreateTemplate(), useUpdateTemplate(), useDeleteTemplate()` from api
- Produces: Route at `/admin/template`

- [ ] **Create AdminTemplatePage.tsx** (follows CategoriesPage.tsx pattern exactly)

```typescript
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-3xl">
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
```

---

### Task 6: Navigation + Routes

**Files:**
- Modify: `src/components/AppLayout.tsx` — add Template nav link
- Modify: `src/App.tsx` — add Template routes and imports

- [ ] **Add FileText icon import to AppLayout.tsx**

Add `FileText` to the lucide-react import line:
```typescript
import {
  LayoutDashboard,
  FilePlus,
  FileSearch,
  FileText,
  FolderKanban,
  Building2,
  Users,
  LogOut,
} from "lucide-react";
```

- [ ] **Add Template nav link to sidebar** (after Tracking link, before Admin section)

```typescript
<NavLink to="/templates" icon={FileText} label="Template" active={location.pathname === "/templates"} />
```

- [ ] **Add Template bottom nav link** (after Tracking, before Admin)

```typescript
<Link to="/templates" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/templates" ? "text-primary" : "text-muted-foreground"}`}>
  <FileText size={20} />
  <span className="text-[10px]">Template</span>
</Link>
```

- [ ] **Add imports + routes to App.tsx**

Add imports:
```typescript
import TemplateListPage from "@/pages/TemplateListPage";
import TemplateDetailPage from "@/pages/TemplateDetailPage";
import AdminTemplatePage from "@/pages/admin/AdminTemplatePage";
```

Add routes inside the inner `<Routes>`:
```typescript
<Route path="/templates" element={<TemplateListPage />} />
<Route path="/templates/:id" element={<TemplateDetailPage />} />
<Route path="/admin/template" element={<AdminTemplatePage />} />
```
