# Setup Google Authentication

## Checklist untuk Memastikan Google Auth Bekerja

### 1. Konfigurasi Firebase Console
- [ ] Buka Firebase Console: https://console.firebase.google.com
- [ ] Pilih project Anda
- [ ] Masuk ke **Authentication** > **Sign-in method**
- [ ] Enable **Google** sebagai sign-in provider
- [ ] Salin **Web client ID** (format: `xxxxx.apps.googleusercontent.com`)

### 2. Konfigurasi Kode
- [ ] Buka `screens/LoginScreen.tsx`
- [ ] Ganti `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` dengan Web client ID Anda (baris 34)
- [ ] Pastikan format: `const GOOGLE_CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';`

### 3. Testing
- [ ] Jalankan aplikasi: `npx expo start`
- [ ] Klik tombol "Continue with Google"
- [ ] Browser akan terbuka untuk login Google
- [ ] Setelah login, aplikasi akan kembali dan user ter-authenticate

## Troubleshooting

### Error: "Configuration Required"
- Pastikan Anda sudah mengganti `GOOGLE_CLIENT_ID` dengan Client ID yang benar
- Client ID harus dari Firebase Console, bukan dari Google Cloud Console

### Error: "No id_token in response"
- Pastikan redirect URI sudah terdaftar di Google Cloud Console
- Redirect URI biasanya: `exp://127.0.0.1:8081` atau `https://auth.expo.io/@your-username/your-app`

### Error: "Authentication Failed"
- Pastikan Google Sign-in sudah di-enable di Firebase Console
- Pastikan Web client ID yang digunakan benar
- Cek console log untuk error detail

## Catatan Penting

1. **Web Client ID**: Gunakan Web client ID dari Firebase, bukan Android/iOS client ID
2. **Redirect URI**: Expo akan otomatis generate redirect URI, pastikan sudah terdaftar di Google Console jika diperlukan
3. **Testing**: Test di device fisik atau emulator, bukan hanya di web browser

## Dependencies yang Diperlukan

Semua dependencies sudah terinstall:
- ✅ `expo-auth-session`
- ✅ `expo-web-browser`
- ✅ `expo-crypto`
- ✅ `firebase`

