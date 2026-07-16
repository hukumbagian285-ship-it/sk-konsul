# Template Menu

## Overview
Tambah menu "Template" untuk menampilkan daftar dokumen template SK dari Google Drive (.docx) lengkap dengan aturan pembuatannya. Template dikelola oleh super_admin, bisa dilihat oleh semua role.

## Database
Tabel `sk_templates`:
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| nama_template | VARCHAR(255) NOT NULL | e.g. "NODIS", "SK" |
| deskripsi | TEXT | nullable |
| drive_file_id | TEXT NOT NULL | Google Drive file ID .docx |
| aturan_penulisan | TEXT | Markdown — font, ukuran, margin, dll |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

## API Hooks (src/lib/api.ts)
- `useTemplates()` — GET all templates
- `useTemplate(id)` — GET single template
- `useCreateTemplate()` — POST new template
- `useUpdateTemplate()` — PATCH template
- `useDeleteTemplate()` — DELETE template

## Halaman
1. **`/templates`** (TemplateListPage) — semua role
   - Card list tiap template: nama + deskripsi singkat
   - Klik → `/templates/:id`

2. **`/templates/:id`** (TemplateDetailPage) — semua role
   - Nama template
   - Google Docs embed (iframe `https://docs.google.com/document/d/{drive_file_id}/preview`)
   - Aturan penulisan (render markdown)

3. **`/admin/template`** (AdminTemplatePage) — super_admin only
   - Table CRUD sama kaya halaman admin lain
   - Columns: nama_template, deskripsi, drive_file_id, aturan_penulisan

## Routes
- `/templates` → TemplateListPage
- `/templates/:id` → TemplateDetailPage
- `/admin/template` → AdminTemplatePage

## Navigation
Sidebar + Bottom nav: tambah item "Template" (icon: `FileText`), muncul untuk semua role.

## Supabase RLS
- SELECT: semua authenticated
- INSERT/UPDATE/DELETE: super_admin only
