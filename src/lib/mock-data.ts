import type { SkSubmission, SkComment, SkVersion, SkStatusHistory, SkCategory, Instansi } from "./types";

// Data contoh untuk pengembangan UI. Hapus/ganti setelah query Supabase asli terpasang (TanStack Query).

export const MOCK_INSTANSI: Instansi[] = [
  { id: "i1", nama_instansi: "BAPPERIDA Kab. Sumba Barat", kode_instansi: "BAPPERIDA" },
  { id: "i2", nama_instansi: "Dinas Kesehatan Kab. Sumba Barat", kode_instansi: "DINKES" },
  { id: "i3", nama_instansi: "Sekretariat Daerah Kab. Sumba Barat", kode_instansi: "SETDA" },
];

export const MOCK_CATEGORIES: SkCategory[] = [
  { id: "c1", nama_kategori: "SK Pengangkatan Jabatan", deskripsi: null, is_active: true },
  { id: "c2", nama_kategori: "SK Tim Kerja/Panitia", deskripsi: null, is_active: true },
  { id: "c3", nama_kategori: "SK Penetapan Anggaran", deskripsi: null, is_active: true },
];

export const MOCK_SUBMISSIONS: SkSubmission[] = [
  {
    id: "s1",
    nomor_tiket: "SK/2026/VII/0001",
    nomor_sk: null,
    judul_sk: "SK Tim Percepatan Penurunan Stunting",
    deskripsi: "Pembentukan tim lintas OPD untuk percepatan penurunan stunting 2026",
    kategori_id: "c2",
    kategori_nama: "SK Tim Kerja/Panitia",
    pemohon_id: "demo-pemohon",
    instansi_id: "i2",
    instansi_nama: "Dinas Kesehatan Kab. Sumba Barat",
    status: "Reviu Hukum",
    tanggal_penetapan: null,
    created_at: "2026-07-10T02:00:00Z",
    updated_at: "2026-07-12T04:00:00Z",
  },
  {
    id: "s2",
    nomor_tiket: "SK/2026/VII/0002",
    nomor_sk: null,
    judul_sk: "SK Pengangkatan Pejabat Pengelola Informasi dan Dokumentasi",
    deskripsi: null,
    kategori_id: "c1",
    kategori_nama: "SK Pengangkatan Jabatan",
    pemohon_id: "demo-pemohon",
    instansi_id: "i1",
    instansi_nama: "BAPPERIDA Kab. Sumba Barat",
    status: "Draft Masuk",
    tanggal_penetapan: null,
    created_at: "2026-07-13T01:00:00Z",
    updated_at: "2026-07-13T01:00:00Z",
  },
  {
    id: "s3",
    nomor_tiket: "SK/2026/VI/0014",
    nomor_sk: null,
    judul_sk: "SK Penetapan Pagu Anggaran Perubahan",
    deskripsi: null,
    kategori_id: "c3",
    kategori_nama: "SK Penetapan Anggaran",
    pemohon_id: "demo-pemohon",
    instansi_id: "i3",
    instansi_nama: "Sekretariat Daerah Kab. Sumba Barat",
    status: "Revisi Pemohon",
    tanggal_penetapan: null,
    created_at: "2026-06-28T03:00:00Z",
    updated_at: "2026-07-05T06:00:00Z",
  },
  {
    id: "s4",
    nomor_tiket: "SK/2026/VI/0011",
    nomor_sk: null,
    judul_sk: "SK Panitia Pengadaan Barang dan Jasa",
    deskripsi: null,
    kategori_id: "c2",
    kategori_nama: "SK Tim Kerja/Panitia",
    pemohon_id: "demo-pemohon",
    instansi_id: "i1",
    instansi_nama: "BAPPERIDA Kab. Sumba Barat",
    status: "Finalisasi",
    tanggal_penetapan: null,
    created_at: "2026-06-20T01:00:00Z",
    updated_at: "2026-07-08T02:00:00Z",
  },
  {
    id: "s5",
    nomor_tiket: "SK/2026/V/0032",
    nomor_sk: "188.4/32/SETDA/2026",
    judul_sk: "SK Penetapan Standar Pelayanan Minimal",
    deskripsi: null,
    kategori_id: "c1",
    kategori_nama: "SK Pengangkatan Jabatan",
    pemohon_id: "demo-pemohon",
    instansi_id: "i2",
    instansi_nama: "Dinas Kesehatan Kab. Sumba Barat",
    status: "Selesai",
    tanggal_penetapan: "2026-06-01",
    created_at: "2026-05-15T01:00:00Z",
    updated_at: "2026-06-01T01:00:00Z",
  },
];

export const MOCK_VERSIONS: SkVersion[] = [
  {
    id: "v1",
    submission_id: "s1",
    versi_ke: 1,
    drive_file_id: "mock-drive-id-1",
    catatan_perubahan: "Draf awal diajukan",
    diunggah_oleh: "demo-pemohon",
    created_at: "2026-07-10T02:00:00Z",
  },
];

export const MOCK_COMMENTS: SkComment[] = [
  {
    id: "cm1",
    submission_id: "s1",
    version_id: "v1",
    user_id: "demo-staf-hukum",
    user_nama: "Flafianus Dua",
    komentar: "Dasar hukum perlu diganti mengacu Permendagri terbaru.",
    lokasi_pasal: "Pasal 4 Ayat 2",
    created_at: "2026-07-11T05:00:00Z",
  },
];

export const MOCK_STATUS_HISTORY: SkStatusHistory[] = [
  {
    id: "h1",
    submission_id: "s1",
    status_lama: null,
    status_baru: "Draft Masuk",
    diubah_oleh: "demo-pemohon",
    diubah_oleh_nama: "Achmad Aqil Susanto, S.Kom",
    catatan: null,
    created_at: "2026-07-10T02:00:00Z",
  },
  {
    id: "h2",
    submission_id: "s1",
    status_lama: "Draft Masuk",
    status_baru: "Pemeriksaan Berkas",
    diubah_oleh: "demo-staf-hukum",
    diubah_oleh_nama: "Flafianus Dua",
    catatan: null,
    created_at: "2026-07-10T08:00:00Z",
  },
  {
    id: "h3",
    submission_id: "s1",
    status_lama: "Pemeriksaan Berkas",
    status_baru: "Reviu Hukum",
    diubah_oleh: "demo-staf-hukum",
    diubah_oleh_nama: "Flafianus Dua",
    catatan: null,
    created_at: "2026-07-12T04:00:00Z",
  },
];
