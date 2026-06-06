# CauseFast — Aplikasi Bendahara Patungan

Aplikasi mobile untuk bendahara organisasi. Catat patungan/HTM acara, lacak progres cicilan anggota, dan share laporan langsung ke WhatsApp.

---

## Fitur

- **Multi-event** — kelola banyak acara sekaligus
- **Progress bar visual** — indikator dana terkumpul
- **Status otomatis** — Lunas / Nyicil / Belum Bayar dihitung otomatis
- **Data persisten** — tersimpan di HP meski aplikasi ditutup
- **Share ke WhatsApp** — laporan terformat rapi, dikelompokkan per status
- **Long-press** untuk hapus event atau anggota

---

## Cara Menjalankan

### Prasyarat
- Node.js 18+
- Expo Go di smartphone (App Store / Play Store)

### Langkah

```bash
git clone <repo-url>
cd PatunganApp
npm install
npx expo start
# Scan QR Code dengan Expo Go di HP
```

---

## Struktur Folder

```
PatunganApp/
├── App.js                        # Entry point & state navigation
├── app.json                      # Konfigurasi Expo
├── package.json
├── babel.config.js
└── src/
    ├── screens/
    │   ├── EventListScreen.js
    │   └── EventDetailScreen.js
    ├── components/
    │   ├── EventCard.js
    │   ├── MemberRow.js
    │   ├── ProgressBar.js
    │   └── StatusBadge.js
    ├── modals/
    │   ├── AddEventModal.js
    │   ├── AddAnggotaModal.js
    │   └── UpdatePayModal.js
    └── utils/
        ├── storage.js
        ├── statusHelper.js
        ├── shareHelper.js
        ├── colors.js
        └── useFocusEffect.js
```

---

## Logika Status Otomatis

```
dibayar === 0              -> Belum
0 < dibayar < tagihan      -> Nyicil
dibayar >= tagihan         -> Lunas
```

---

## Struktur Data (AsyncStorage)

```json
[
  {
    "id": "evt_1719123456789",
    "nama": "Outing Karyawan",
    "targetDana": 5000000,
    "tanggal": "22 Juni 2025",
    "anggota": [
      {
        "id": "ang_1719123456789_ab1c",
        "nama": "Budi Santoso",
        "tagihan": 500000,
        "dibayar": 500000,
        "status": "Lunas"
      }
    ]
  }
]
```

---

## Setup EAS Build

Project ini sudah siap untuk EAS (Expo Application Services). Jalankan perintah berikut untuk build:

```bash
eas build --platform android   # Build APK/AAB
eas build --platform ios       # Build IPA
eas update                     # OTA update langsung ke pengguna
```

Pastikan sudah login ke Expo dan file `eas.json` sudah terkonfigurasi.

---

## Tips Penggunaan

- **Long-press** kartu acara untuk menghapus acara
- **Long-press** baris anggota untuk menghapus anggota
- Gunakan shortcut **+50rb / +100rb / Lunas** saat update cicilan
- Tombol **Share** otomatis mengelompokkan anggota per status
