# Sistem Informasi Konsultasi SK

Implementasi awal (scaffold) berdasarkan `docs/superpowers/specs/2026-07-14-sk-konsultasi-design-v2.md` (v4).

## Status implementasi

Scaffold ini berisi UI 3 halaman MVP dengan **data mock** (`src/lib/mock-data.ts`) agar bisa langsung dijalankan dan direview desainnya sebelum disambungkan ke Supabase & Google Apps Script sungguhan.

- ✅ Dashboard Kanban (`/`) — 6 kolom status, filter kategori/instansi, RBAC-aware (pemohon hanya lihat miliknya)
- ✅ Form Pengajuan SK (`/submissions/new`) — upload draf + lampiran via helper `uploadViaGas` (siap pakai begitu `VITE_GAS_UPLOAD_URL` diisi)
- ✅ Detail SK (`/submissions/:id`) — versi dokumen, komentar per lokasi pasal, riwayat status, tombol aksi transisi status sesuai matrix RBAC 4.2
- ✅ Role switcher di header (khusus mode dev) untuk menguji tampilan per role tanpa login sungguhan

## Yang BELUM tersambung (langkah lanjutan)

1. **Supabase asli** — isi `.env` dari `.env.example`, jalankan seluruh DDL + RLS + trigger di spec Bagian 3.2/3.3 ke project Supabase, lalu ganti `src/lib/mock-data.ts` dengan query TanStack Query ke `supabase.from(...)`.
2. **Supabase Auth** — ganti `src/lib/auth-context.tsx` (saat ini demo role-switcher) dengan `supabase.auth` sungguhan + ambil `role` dari tabel `profiles`.
3. **Skrip Google Apps Script** — belum dibuat di repo ini (GAS di-deploy terpisah dari Google Workspace, bukan bagian dari repo Vite). Skrip perlu: validasi `token`, validasi ukuran & MIME, `DriveApp.createFolder()` per instansi/nomor_tiket, kembalikan `drive_file_id` sebagai JSON.
4. Form pengajuan saat ini upload file dulu baru idealnya INSERT `sk_submissions` — di produksi urutannya perlu dibalik (INSERT dulu agar dapat `nomor_tiket` asli dari trigger, baru upload ke folder bernama nomor_tiket itu) — lihat komentar TODO di `src/pages/SubmissionForm.tsx`.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env   # isi VITE_SUPABASE_URL dkk setelah project Supabase siap
npm run dev
```

## Struktur

```
src/
├── components/ui/     # komponen dasar gaya shadcn (button, card, badge, input, select)
├── lib/
│   ├── types.ts        # tipe data + matrix TRANSISI_SAH (cermin RBAC 4.2)
│   ├── supabase.ts      # client Supabase (perlu .env)
│   ├── gas-upload.ts    # helper upload ke Google Apps Script Web App
│   ├── auth-context.tsx # auth sementara (role switcher demo)
│   └── mock-data.ts     # data contoh, hapus setelah Supabase tersambung
└── pages/
    ├── DashboardKanban.tsx
    ├── SubmissionForm.tsx
    └── SubmissionDetail.tsx
```

## Desain

Palette & tipografi mengikuti spec Bagian 7 (direvisi v5): primary `#2563EB`, accent `#059669`, display face **Fraunces**, body **Inter**, mono **JetBrains Mono** khusus nomor tiket (`[ SK/2026/VII/0001 ]`).
