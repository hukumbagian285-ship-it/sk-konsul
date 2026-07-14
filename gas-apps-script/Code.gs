/**
 * Google Apps Script Web App — Upload file ke Google Drive untuk Sistem Konsultasi SK.
 * Selaras dengan spec Bagian 6.2 & 9 (v3/v4/v5).
 *
 * CARA DEPLOY:
 * 1. Buka https://script.google.com dengan akun Google DINAS (bukan personal — lihat catatan
 *    kepemilikan akun di spec Bagian 9 & 11).
 * 2. Buat project baru, tempel isi file ini ke Code.gs.
 * 3. Di menu Project Settings > Script Properties, tambahkan:
 *      UPLOAD_TOKEN     = <string rahasia, sama dengan VITE_GAS_UPLOAD_TOKEN di frontend>
 *      ROOT_FOLDER_ID   = <ID folder Drive root untuk seluruh arsip SK, buat manual dulu>
 * 4. Deploy > New deployment > Web app.
 *      - Execute as: Me (akun dinas)
 *      - Who has access: Anyone with the link (token di body request yang jadi lapisan keamanan,
 *        karena GAS Web App tidak mendukung custom header auth dengan mudah)
 * 5. Salin URL deployment (diakhiri /exec) ke VITE_GAS_UPLOAD_URL di frontend.
 * 6. Setiap kali skrip diedit, perlu "New deployment" lagi (bukan cukup Save) agar URL tetap sama
 *    gunakan "Manage deployments > Edit > New version" agar URL tidak berubah.
 */

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB — selaras spec Bagian 9
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'image/jpeg',
  'image/png',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { token, folderPath, fileName, mimeType, data } = body;

    validateToken_(token);
    validateFile_(fileName, mimeType, data);

    const folder = resolveFolderPath_(folderPath);
    const blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType, fileName);
    const file = folder.createFile(blob);

    return jsonResponse_({
      drive_file_id: file.getId(),
      nama_file: fileName,
      ukuran_bytes: file.getSize(),
      tipe_file: mimeType,
    });
  } catch (err) {
    return jsonResponse_({ error: err.message || String(err) });
  }
}

/** GET dipakai untuk download/verifikasi file (opsional, dipanggil dari Detail SK) */
function doGet(e) {
  try {
    const token = e.parameter.token;
    const fileId = e.parameter.file_id;
    validateToken_(token);

    if (!fileId) {
      throw new Error('Parameter file_id wajib diisi.');
    }
    const file = DriveApp.getFileById(fileId);
    return jsonResponse_({
      nama_file: file.getName(),
      url: file.getUrl(),
      ukuran_bytes: file.getSize(),
      tipe_file: file.getMimeType(),
    });
  } catch (err) {
    return jsonResponse_({ error: err.message || String(err) });
  }
}

function validateToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('UPLOAD_TOKEN');
  if (!expected) {
    throw new Error('UPLOAD_TOKEN belum dikonfigurasi di Script Properties.');
  }
  if (token !== expected) {
    throw new Error('Token tidak valid.');
  }
}

function validateFile_(fileName, mimeType, base64Data) {
  if (!fileName || !mimeType || !base64Data) {
    throw new Error('fileName, mimeType, dan data wajib diisi.');
  }
  if (ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) {
    throw new Error('Format file tidak didukung: ' + mimeType);
  }
  // Perkiraan ukuran asli dari panjang base64 (base64 ~33% lebih besar dari data asli)
  const approxBytes = Math.floor((base64Data.length * 3) / 4);
  if (approxBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error('Ukuran file melebihi batas maksimal 20 MB.');
  }
}

/**
 * folderPath format: "{kode_instansi}/{nomor_tiket}" contoh "BAPPERIDA/SK-2026-VII-0001"
 * Dibuat bertingkat di bawah ROOT_FOLDER_ID jika belum ada (idempotent).
 * Slash pada nomor_tiket asli ("SK/2026/VII/0001") harus diganti dash oleh
 * frontend sebelum dikirim, karena "/" tidak valid sebagai nama folder tunggal.
 */
function resolveFolderPath_(folderPath) {
  const rootId = PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID');
  if (!rootId) {
    throw new Error('ROOT_FOLDER_ID belum dikonfigurasi di Script Properties.');
  }
  let current = DriveApp.getFolderById(rootId);
  const segments = String(folderPath || '').split('/').filter(Boolean);

  segments.forEach((segment) => {
    const existing = current.getFoldersByName(segment);
    current = existing.hasNext() ? existing.next() : current.createFolder(segment);
  });

  return current;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
