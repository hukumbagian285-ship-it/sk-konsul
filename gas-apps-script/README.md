# Google Apps Script — Upload Endpoint

Skrip ini **tidak** dijalankan lewat `npm`/Vite — dideploy terpisah lewat https://script.google.com, karena GAS bukan bagian dari bundle frontend (spec Bagian 2 & 9, v3).

## Langkah deploy

1. Buka https://script.google.com dengan **akun Google dinas** (bukan akun personal — lihat spec Bagian 11 poin 4 soal risiko kepemilikan akun personal).
2. Buat project baru → tempel isi `Code.gs` ke editor.
3. Buat 1 folder root di Google Drive akun tersebut untuk menampung seluruh arsip SK, salin ID folder-nya dari URL (`https://drive.google.com/drive/folders/<ID_INI>`).
4. Di editor GAS: **Project Settings (ikon gerigi) → Script Properties → Add script property**:
   | Property | Value |
   |---|---|
   | `UPLOAD_TOKEN` | string acak panjang, contoh hasil `openssl rand -hex 32` |
   | `ROOT_FOLDER_ID` | ID folder dari langkah 3 |
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone with the link**
6. Salin URL yang diakhiri `/exec`.
7. Isi di frontend (`.env`):
   ```
   VITE_GAS_UPLOAD_URL=<url dari langkah 6>
   VITE_GAS_UPLOAD_TOKEN=<UPLOAD_TOKEN dari langkah 4>
   ```

## Update skrip setelah deploy pertama

Supaya URL `/exec` tidak berubah setiap edit: **Manage deployments → Edit (ikon pensil) → Version: New version → Deploy**. Jangan pakai "New deployment" lagi setelah yang pertama, kecuali sengaja ingin URL baru.

## Catatan keamanan

- Token dikirim di **body** JSON (bukan header) karena keterbatasan GAS Web App menerima header custom dengan mudah dari `fetch` lintas origin. Ini bukan pengganti HTTPS — token tetap harus dirahasiakan dan sebaiknya dirotasi berkala (lihat spec Bagian 11 poin 5, masih perlu keputusan).
- Validasi ukuran & MIME type dilakukan **dua kali**: di frontend (`src/lib/gas-upload.ts`) dan di skrip ini — jangan hanya andalkan validasi frontend karena bisa dilewati siapa saja yang tahu URL endpoint.
