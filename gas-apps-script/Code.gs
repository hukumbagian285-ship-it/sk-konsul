/**
 * GAS Web App — Upload SK ke Google Drive.
 * Folder otomatis: sk-konsul/{nama_instansi}/{nomor_tiket}/
 *
 * CARA DEPLOY:
 * 1. Buka https://script.google.com, buat project baru, paste kode ini.
 * 2. (Opsional) Project Settings > Script Properties > UPLOAD_TOKEN = string rahasia
 * 3. Deploy > New deployment > Web App > Execute as: Me, Who has access: Anyone
 * 4. URL deployment → VITE_GAS_UPLOAD_URL di Vercel
 */

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
  if (expected && token !== expected) {
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
  const approxBytes = Math.floor((base64Data.length * 3) / 4);
  if (approxBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error('Ukuran file melebihi batas maksimal 20 MB.');
  }
}

function resolveFolderPath_(folderPath) {
  let current = rootFolder_();
  var segments = String(folderPath || '').split('/').filter(Boolean);
  for (var i = 0; i < segments.length; i++) {
    var fs = current.getFoldersByName(segments[i]);
    current = fs.hasNext() ? fs.next() : current.createFolder(segments[i]);
  }
  return current;
}

function rootFolder_() {
  var fs = DriveApp.getFoldersByName('sk-konsul');
  return fs.hasNext() ? fs.next() : DriveApp.createFolder('sk-konsul');
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}