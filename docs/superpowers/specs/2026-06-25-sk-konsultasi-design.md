# Sistem Informasi Konsultasi Surat Keputusan (SK)
## Bagian Hukum — Sekretariat Daerah Kabupaten Sumba Barat

**Tanggal:** 2026-06-25
**Status:** Draft Spec (Menunggu Review)

---

## 1. Ringkasan

Sistem Informasi Konsultasi Surat Keputusan (SK) adalah *Document Management System* (DMS) berbasis alur kerja (*workflow-driven*) untuk mendigitalisasi, melacak, dan mempercepat proses reviu hukum terhadap draf SK yang diajukan oleh berbagai unit kerja atau Organisasi Perangkat Daerah (OPD).

---

## 2. Arsitektur Sistem

**Frontend:** React + Vite + TypeScript + shadcn/ui + TanStack Query + React Router — SPA, Tailwind styling, light/dark mode via CSS variables.

**Backend:** Supabase (PostgreSQL, Auth, RLS, Realtime) + Google Drive API (file storage, Supabase simpan Drive file ID).

**MVP dependencies:** React + Vite + shadcn/ui + TanStack Query + React Router. TanStack Table, dnd-kit, Edge Functions cron menyusul di fase berikutnya.

---

## 3. Database Schema (PostgreSQL)

### 3.1 Entity Relationship (MVP)

```
TABEL INTI:
├── instansi              — OPD/unit kerja pemohon
├── sk_categories         — kategori/jenis SK
├── profiles              — ekstensi auth.users
├── sk_submissions        — pengajuan SK utama
├── sk_versions           — kontrol versi dokumen
├── sk_attachments        — lampiran dokumen pendukung
├── sk_comments           — komentar perbaikan per versi
```

Tabel `sk_status_history`, `notifications`, `sk_status_targets` ditambahkan di fase berikutnya. Status workflow hardcoded via CHECK constraint di MVP.

### 3.2 DDL Lengkap (MVP)

```sql
-- 1. TABEL INSTANSI / OPD
CREATE TABLE instansi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_instansi VARCHAR(255) NOT NULL,
    kode_instansi VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL KATEGORI SK
CREATE TABLE sk_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_kategori VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL PROFIL PENGGUNA
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'pemohon', 'staf_hukum', 'pimpinan')),
    instansi_id UUID REFERENCES instansi(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL PENGAJUAN SK
-- ponytail: status hardcoded via CHECK, tabel status dinamis menyusul di Fase 4
CREATE TABLE sk_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_tiket VARCHAR(100) UNIQUE NOT NULL,
    nomor_sk VARCHAR(255),
    judul_sk TEXT NOT NULL,
    deskripsi TEXT,
    kategori_id UUID REFERENCES sk_categories(id) ON DELETE SET NULL,
    pemohon_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    instansi_id UUID REFERENCES instansi(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Draft Masuk' CHECK (status IN (
        'Draft Masuk', 'Pemeriksaan Berkas', 'Reviu Hukum',
        'Revisi Pemohon', 'Finalisasi', 'Selesai'
    )),
    tanggal_penetapan DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL VERSI DOKUMEN
-- ponytail: drive_file_id cukup, file_path diturunkan dari ID
CREATE TABLE sk_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES sk_submissions(id) ON DELETE CASCADE,
    versi_ke INT NOT NULL,
    drive_file_id TEXT NOT NULL,
    catatan_perubahan TEXT,
    diunggah_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id, versi_ke)
);

-- 6. TABEL LAMPIRAN DOKUMEN PENDUKUNG
-- ponytail: sama, cukup drive_file_id
CREATE TABLE sk_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES sk_submissions(id) ON DELETE CASCADE,
    nama_file TEXT NOT NULL,
    drive_file_id TEXT NOT NULL,
    tipe_file VARCHAR(100),
    ukuran_bytes BIGINT,
    diunggah_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABEL KOMENTAR PERBAIKAN
-- ponytail: flat comments (belum threaded), lokasi_pasal untuk referensi bagian dokumen
CREATE TABLE sk_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES sk_submissions(id) ON DELETE CASCADE,
    version_id UUID REFERENCES sk_versions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    komentar TEXT NOT NULL,
    lokasi_pasal VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Row Level Security (RLS) Policies

- **Super Admin:** Full akses semua tabel
- **Pemohon:** CRUD data milik sendiri (`pemohon_id = auth.uid()`), baca komentar
- **Staf Hukum:** Read semua submission, upload versi, buat komentar
- **Pimpinan:** Read semua submission, ubah status ke Selesai

---

## 4. RBAC & Hak Akses (MVP)

| Fitur | Super Admin | Pimpinan | Staf Hukum | Pemohon |
|-------|:-----------:|:--------:|:----------:|:-------:|
| Lihat semua SK | ✅ | ✅ | ✅ | ❌ (milik sendiri) |
| Buat pengajuan baru | ✅ | ✅ | ❌ | ✅ |
| Ubah status SK | ✅ | ✅ (Final→Selesai) | ✅ (proses review) | ❌ |
| Upload revisi | ✅ | ❌ | ❌ | ✅ |
| Komentar perbaikan | ✅ | ✅ | ✅ | ❌ |
| Baca komentar | ✅ | ✅ | ✅ | ✅ |

Manajemen pengguna, kategori, dan dashboard statistik via database langsung di MVP.

---

## 5. Halaman & Routing (MVP)

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/` | Dashboard Kanban | Board status, click-to-move, filter |
| `/submissions/new` | Form Pengajuan SK | Upload draf + lampiran |
| `/submissions/:id` | Detail SK | Versi dokumen + daftar lampiran + komentar |

---

## 6. Fitur & Alur (MVP)

### 6.1 Dashboard Kanban
- Kolom berdasarkan 6 status (hardcoded)
- Kartu SK dipindah via dropdown/button — ponytail: click-to-move, dnd-kit menyusul jika diminta
- Filter by kategori, instansi

### 6.2 Form Pengajuan SK
- Pilih kategori, isi judul, deskripsi
- Upload draf SK ke Google Drive via Edge Function
- Upload lampiran pendukung

### 6.3 Detail SK — Reviu & Komentar
- Informasi SK + riwayat versi
- Download file dari Google Drive
- Upload versi revisi
- **Komentar perbaikan per versi:** Reviewer menulis komentar + lokasi pasal yang salah (contoh: "Pasal 4 Ayat 2 — dasar hukum perlu diganti PP No.XX")
- Pemohon melihat komentar dan mengupload versi perbaikan
- Komentar datar (belum threaded) — threading menyusul di Fase 2

---

## 7. Desain Visual

**Style:** Trust & Authority — formal, profesional.

**Palette:** `#2563EB` (primary), `#059669` (accent), `#0F172A`/`#F8FAFC` (foreground/background), light + dark mode via Tailwind `dark:`.

**Font:** System font stack — ponytail: no Google Fonts load, system-ui sudah cukup untuk internal tool.

**Komponen:** shadcn/ui (Button, Input, Card, Badge, Select, Dialog, Table).

---

## 8. Otomasi (MVP)

Hanya upload file ke Google Drive via Supabase Edge Function. Cron, notifikasi, SLA menyusul di fase berikutnya.

---

## 9. Batasan & Catatan

- **Penyimpanan:** Google Drive via Service Account, Supabase simpan `drive_file_id`
- **Upload:** Frontend → Edge Function → Google Drive → simpan ID ke DB
- **Format file:** .docx, .pdf, .xlsx, .jpg, .png
- **Autentikasi:** Supabase Auth (email/password)
- **Tidak menggunakan n8n, Telegram, WhatsApp** — notifikasi menyusul

---

## 10. Roadmap

| Fase | Fitur |
|------|-------|
| **Fase 1 (MVP)** | 7 tabel, Auth, CRUD SK, upload/download Google Drive, Kanban click-to-move, komentar lokasi pasal |
| **Fase 2** | Komentar threaded/blok teks, riwayat status, TanStack Table, dnd-kit |
| **Fase 3** | Notifikasi in-app (Realtime), SLA tracking |
| **Fase 4** | Admin panel (user, kategori manajemen), Edge Functions cron |
| **Fase 5** | Deployment Docker + Coolify |

---

*Spec document ini berdasarkan hasil brainstorming. Siap di-review dan ditindaklanjuti ke implementation plan.*
