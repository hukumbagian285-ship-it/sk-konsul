// Helper upload file ke Google Drive lewat Google Apps Script Web App (spec Bagian 6.2 & 9, v3).
// Frontend fetch LANGSUNG ke URL GAS — tidak lewat Supabase Edge Function.
//
// Env yang dibutuhkan (isi di .env):
//   VITE_GAS_UPLOAD_URL   -> URL deployment Web App GAS (.../exec)
//   VITE_GAS_UPLOAD_TOKEN -> token statis untuk otentikasi endpoint (lihat catatan keamanan spec Bagian 9)
//
// Skrip GAS di sisi server WAJIB memvalidasi:
//   - token cocok
//   - ukuran file <= batas maksimal (usulan 20 MB)
//   - MIME type termasuk whitelist: .docx, .pdf, .xlsx, .jpg, .png

const GAS_UPLOAD_URL = import.meta.env.VITE_GAS_UPLOAD_URL as string;
const GAS_UPLOAD_TOKEN = import.meta.env.VITE_GAS_UPLOAD_TOKEN as string;

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB, selaras spec Bagian 9
const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "image/jpeg",
  "image/png",
];

export interface GasUploadResult {
  drive_file_id: string;
  nama_file: string;
  ukuran_bytes: number;
  tipe_file: string;
}

export class GasUploadError extends Error {}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload satu file ke Google Drive lewat GAS Web App.
 * folderPath disarankan mengikuti struktur spec Bagian 9: {instansi}/{nomor_tiket}/
 */
export async function uploadViaGas(file: File, folderPath: string): Promise<GasUploadResult> {
  if (!GAS_UPLOAD_URL) {
    throw new GasUploadError("VITE_GAS_UPLOAD_URL belum dikonfigurasi.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new GasUploadError(`File melebihi batas ukuran maksimal (20 MB): ${file.name}`);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new GasUploadError(`Format file tidak didukung: ${file.name} (${file.type})`);
  }

  const base64Data = await toBase64(file);

  // text/plain biar ga trigger CORS preflight (GAS Web App ga handle OPTIONS)
  const response = await fetch(GAS_UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      token: GAS_UPLOAD_TOKEN,
      folderPath,
      fileName: file.name,
      mimeType: file.type,
      data: base64Data,
    }),
  });

  if (!response.ok) {
    throw new GasUploadError(`Upload gagal (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (result.error) {
    throw new GasUploadError(result.error);
  }

  return {
    drive_file_id: result.drive_file_id,
    nama_file: file.name,
    ukuran_bytes: file.size,
    tipe_file: file.type,
  };
}
