# Setup Google Authentication

## Langkah 1: Enable Google Sign-In di Firebase

1. Buka **Firebase Console**: https://console.firebase.google.com
2. Pilih project **projek-57f01**
3. Di menu sebelah kiri, klik **Authentication**
4. Klik tab **Sign-in method**
5. Klik **Google** di daftar providers
6. Toggle **Enable** ke ON
7. Isi **Project support email** dengan email Anda
8. Klik **Save**

## Langkah 2: Salin Web Client ID

1. Setelah Google Sign-In di-enable, klik **Google** lagi
2. Anda akan melihat **Web client ID** dan **Web client secret**
3. **SALIN Web client ID** (BUKAN secret)
4. Format: `983899879214-xxxxxxxxxxxxx.apps.googleusercontent.com`

## Langkah 3: Update Kode

Buka file `screens/LoginScreen.tsx`, baris 38, ganti:

```typescript
const GOOGLE_CLIENT_ID: string = 'PASTE_YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com';
```

Dengan:

```typescript
const GOOGLE_CLIENT_ID: string = '983899879214-xxxxx.apps.googleusercontent.com'; // Ganti dengan ID Anda
```

## Langkah 4: Daftarkan Redirect URI

1. Buka **Google Cloud Console**: https://console.cloud.google.com
2. Pilih project yang sama dengan Firebase
3. Masuk ke **APIs & Services** > **Credentials**
4. Klik pada **OAuth 2.0 Client ID** (Web client)
5. Di bagian **Authorized redirect URIs**, tambahkan:
   - `http://localhost:8081`
   - `http://localhost:19006`
   - `exp://localhost:8081`
   - `exp://127.0.0.1:8081`
6. Di bagian **Authorized JavaScript origins**, tambahkan:
   - `http://localhost:8081`
   - `http://localhost:19006`
7. Klik **Save**

## Langkah 5: Test

1. Restart development server: `npx expo start --clear`
2. Buka aplikasi di browser atau emulator
3. Klik "Continue with Google"
4. Login dengan akun Google Anda

## Troubleshooting

### Error 400
- Pastikan redirect URI sudah terdaftar di Google Cloud Console
- Pastikan Web Client ID format benar (ada dash `-` di tengah)

### Error "popup_closed_by_user"
- User menutup popup login Google

### Error "invalid_client"
- Web Client ID salah atau tidak valid
- Pastikan menggunakan Web Client ID dari Firebase Console

## Catatan

- Web Client ID berbeda dengan API Key
- Web Client ID format: `xxxxx-xxxxx.apps.googleusercontent.com`
- Jangan share Web Client Secret (hanya Client ID yang digunakan di frontend)

