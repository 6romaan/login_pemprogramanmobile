# Fix Error 400 - Google OAuth

## Penyebab Error 400

Error 400 dari Google OAuth biasanya terjadi karena:
1. **Redirect URI tidak terdaftar** di Google Cloud Console
2. **Google Client ID format salah** atau tidak valid
3. **Request parameter tidak sesuai**

## Solusi

### 1. Dapatkan Google Client ID yang Benar

**Format yang benar:**
```
983899879214-xxxxxxxxxxxxx.apps.googleusercontent.com
```

**Cara mendapatkan:**
1. Buka Firebase Console: https://console.firebase.google.com
2. Pilih project Anda
3. Masuk ke **Authentication** > **Sign-in method**
4. Klik **Google** > **Enable**
5. Salin **Web client ID** (bukan Web client secret)
6. Format: `xxxxx-xxxxx.apps.googleusercontent.com` (ada dash `-` di tengah)

### 2. Daftarkan Redirect URI di Google Cloud Console

1. Buka Google Cloud Console: https://console.cloud.google.com
2. Pilih project yang sama dengan Firebase
3. Masuk ke **APIs & Services** > **Credentials**
4. Klik pada **OAuth 2.0 Client ID** (yang Web client)
5. Di bagian **Authorized redirect URIs**, tambahkan:
   - Untuk Web: `http://localhost:8081`, `http://localhost:19006`, atau URL aplikasi web Anda
   - Untuk Native: `tempapp://` atau `exp://127.0.0.1:8081`
6. **Save** perubahan

### 3. Update Kode

Buka `screens/LoginScreen.tsx` baris 35, ganti dengan Client ID yang benar:

```typescript
const GOOGLE_CLIENT_ID: string = '983899879214-xxxxxxxxxxxxx.apps.googleusercontent.com';
```

**PENTING:** 
- Pastikan format ada dash (`-`) di tengah
- Jangan gunakan `project-983899879214.apps.googleusercontent.com`
- Gunakan format: `983899879214-xxxxx.apps.googleusercontent.com`

### 4. Testing

1. Restart development server: `npx expo start --clear`
2. Klik "Continue with Google"
3. Cek console log untuk melihat Redirect URI yang digunakan
4. Pastikan Redirect URI tersebut sudah terdaftar di Google Console

## Debugging

Jika masih error 400, cek console log:
- "Redirect URI: ..." - Salin URI ini
- Daftarkan URI tersebut di Google Cloud Console > Credentials > OAuth 2.0 Client ID > Authorized redirect URIs

## Catatan

- Redirect URI untuk web biasanya: `http://localhost:8081` atau `http://localhost:19006`
- Redirect URI untuk native: `tempapp://` atau `exp://127.0.0.1:8081`
- Pastikan Client ID dari Firebase Console, bukan Google Cloud Console langsung

