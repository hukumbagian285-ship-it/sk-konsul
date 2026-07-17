export interface Instansi {
  id: string;
  nama_instansi: string;
  kode_instansi: string;
  created_at: string;
}

export interface SkCategory {
  id: string;
  nama_kategori: string;
  deskripsi: string | null;
  is_active: boolean | null;
  created_at: string;
}

export type StatusSK = "Draft Masuk" | "Pemeriksaan Berkas" | "Reviu Hukum" | "Revisi Pemohon" | "Finalisasi" | "Selesai";

export type Role = "super_admin" | "pemohon" | "staf_hukum" | "pimpinan";

export const STATUS_WARNA: Record<StatusSK, string> = {
  "Draft Masuk": "bg-blue-50 text-blue-700 border-blue-200",
  "Pemeriksaan Berkas": "bg-purple-50 text-purple-700 border-purple-200",
  "Reviu Hukum": "bg-amber-50 text-amber-700 border-amber-200",
  "Revisi Pemohon": "bg-rose-50 text-rose-700 border-rose-200",
  Finalisasi: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const TRANSISI_SAH: Record<string, Record<StatusSK, StatusSK[]>> = {
  super_admin: {
    "Draft Masuk": ["Pemeriksaan Berkas", "Revisi Pemohon"],
    "Pemeriksaan Berkas": ["Reviu Hukum", "Revisi Pemohon"],
    "Reviu Hukum": ["Finalisasi", "Revisi Pemohon"],
    Finalisasi: ["Selesai"],
    "Revisi Pemohon": ["Pemeriksaan Berkas"],
    Selesai: [],
  },
  pemohon: {
    "Draft Masuk": ["Pemeriksaan Berkas"],
    "Revisi Pemohon": ["Pemeriksaan Berkas"],
    "Revisi Pemohon": ["Pemeriksaan Berkas"],
    Selesai: [],
    "Pemeriksaan Berkas": [],
    "Reviu Hukum": [],
    Finalisasi: [],
  },
  staf_hukum: {
    "Reviu Hukum": ["Revisi Pemohon", "Finalisasi"],
    "Draft Masuk": [],
    "Pemeriksaan Berkas": [],
    "Revisi Pemohon": [],
    Finalisasi: [],
    Selesai: [],
  },
  pimpinan: {
    Finalisasi: ["Selesai"],
    "Draft Masuk": [],
    "Pemeriksaan Berkas": [],
    "Reviu Hukum": [],
    "Revisi Pemohon": [],
    Selesai: [],
  },
};

export interface SkSubmission {
  id: string;
  nomor_tiket: string | null;
  nomor_sk: string | null;
  judul_sk: string;
  deskripsi: string | null;
  kategori_id: string | null;
  pemohon_id: string | null;
  instansi_id: string | null;
  status: string;
  tanggal_penetapan: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkVersion {
  id: string;
  submission_id: string;
  versi_ke: number | null;
  drive_file_id: string;
  catatan_perubahan: string | null;
  diunggah_oleh: string | null;
  created_at: string;
}

export interface SkComment {
  id: string;
  submission_id: string;
  version_id: string;
  user_id: string | null;
  user_nama?: string;
  komentar: string;
  lokasi_pasal: string | null;
  halaman?: number | null;
  pos_x?: number | null;
  pos_y?: number | null;
  lebar?: number | null;
  tinggi?: number | null;
  warna?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface SkTemplate {
  id: string;
  nama_template: string;
  deskripsi: string | null;
  drive_file_id: string;
  aturan_penulisan: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkStatusHistory {
  id: string;
  submission_id: string;
  status_lama: string | null;
  status_baru: string;
  diubah_oleh: string | null;
  catatan: string | null;
  created_at: string;
}

