// Tipe data selaras dengan DDL di spec (Bagian 3.2)

export type Role = "super_admin" | "pimpinan" | "staf_hukum" | "pemohon";

export type StatusSK =
  | "Draft Masuk"
  | "Pemeriksaan Berkas"
  | "Reviu Hukum"
  | "Revisi Pemohon"
  | "Finalisasi"
  | "Selesai";

export const STATUS_URUTAN: StatusSK[] = [
  "Draft Masuk",
  "Pemeriksaan Berkas",
  "Reviu Hukum",
  "Revisi Pemohon",
  "Finalisasi",
  "Selesai",
];

export const STATUS_WARNA: Record<StatusSK, string> = {
  "Draft Masuk": "bg-slate-100 text-slate-700 border-slate-300",
  "Pemeriksaan Berkas": "bg-blue-50 text-primary border-blue-200",
  "Reviu Hukum": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Revisi Pemohon": "bg-amber-50 text-warning border-amber-300",
  Finalisasi: "bg-emerald-50 text-accent border-emerald-200",
  Selesai: "bg-emerald-600 text-white border-emerald-700",
};

export const TRANSISI_SAH: Record<Role, Partial<Record<StatusSK, StatusSK[]>>> = {
  super_admin: {
    "Draft Masuk": ["Pemeriksaan Berkas"],
    "Pemeriksaan Berkas": ["Reviu Hukum", "Revisi Pemohon"],
    "Reviu Hukum": ["Revisi Pemohon", "Finalisasi"],
    Finalisasi: ["Selesai"],
  },
  staf_hukum: {
    "Draft Masuk": ["Pemeriksaan Berkas"],
    "Pemeriksaan Berkas": ["Reviu Hukum", "Revisi Pemohon"],
    "Reviu Hukum": ["Revisi Pemohon", "Finalisasi"],
  },
  pimpinan: {
    Finalisasi: ["Selesai"],
  },
  pemohon: {},
};

export interface Instansi {
  id: string;
  nama_instansi: string;
  kode_instansi: string;
}

export interface SkCategory {
  id: string;
  nama_kategori: string;
  deskripsi: string | null;
  is_active: boolean;
}

export interface Profile {
  id: string;
  nama_lengkap: string;
  role: Role;
  instansi_id: string | null;
}

export interface SkSubmission {
  id: string;
  nomor_tiket: string;
  nomor_sk: string | null;
  judul_sk: string;
  deskripsi: string | null;
  kategori_id: string | null;
  kategori_nama?: string;
  pemohon_id: string | null;
  instansi_id: string | null;
  instansi_nama?: string;
  status: StatusSK;
  tanggal_penetapan: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkVersion {
  id: string;
  submission_id: string;
  versi_ke: number;
  drive_file_id: string;
  catatan_perubahan: string | null;
  diunggah_oleh: string | null;
  created_at: string;
}

export interface SkAttachment {
  id: string;
  submission_id: string;
  nama_file: string;
  drive_file_id: string;
  tipe_file: string | null;
  ukuran_bytes: number | null;
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
}

export interface SkStatusHistory {
  id: string;
  submission_id: string;
  status_lama: StatusSK | null;
  status_baru: StatusSK;
  diubah_oleh: string | null;
  diubah_oleh_nama?: string;
  catatan: string | null;
  created_at: string;
}

export function statusProgress(status: StatusSK): { current: number; total: number } {
  const idx = STATUS_URUTAN.indexOf(status);
  return { current: idx + 1, total: STATUS_URUTAN.length };
}
