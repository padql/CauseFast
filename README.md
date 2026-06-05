# 💰 Kas Acara — Aplikasi Bendahara Patungan

Aplikasi mobile untuk bendahara organisasi. Catat patungan/HTM acara, lacak progres cicilan anggota, dan share laporan langsung ke WhatsApp.

---

## ✨ Fitur

- ✅ **Multi-event** — kelola banyak acara sekaligus
- 📊 **Progress bar visual** — indikator dana terkumpul
- 🤖 **Status otomatis** — Lunas / Nyicil / Belum Bayar dihitung otomatis
- 💾 **Data persisten** — tersimpan di HP meski aplikasi ditutup
- 📤 **Share ke WhatsApp** — laporan terformat rapi, dikelompokkan per status
- 🗑️ **Long-press** untuk hapus event atau anggota

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js versi 18+
- Aplikasi **Expo Go** di smartphone (App Store / Play Store)

### Langkah

```bash
# 1. Clone atau download folder ini
cd PatunganApp

# 2. Install dependencies
npm install

# 3. Jalankan development server
npx expo start

# 4. Scan QR Code dengan Expo Go di HP
#    (pastikan HP & laptop di WiFi yang sama)
```

---

## 📁 Struktur Folder

```
PatunganApp/
├── App.js                        # Entry point & state navigation
├── app.json                      # Konfigurasi Expo
├── package.json
├── babel.config.js
└── src/
    ├── screens/
    │   ├── EventListScreen.js    # Layar daftar acara
    │   └── EventDetailScreen.js  # Layar detail + anggota
    ├── components/
    │   ├── EventCard.js          # Kartu acara di list
    │   ├── MemberRow.js          # Baris anggota + badge
    │   ├── ProgressBar.js        # Progress bar visual
    │   └── StatusBadge.js        # Badge Lunas/Nyicil/Belum
    ├── modals/
    │   ├── AddEventModal.js      # Form buat acara baru
    │   ├── AddAnggotaModal.js    # Form tambah anggota
    │   └── UpdatePayModal.js     # Form update cicilan
    └── utils/
        ├── storage.js            # AsyncStorage CRUD
        ├── statusHelper.js       # Logika status & format
        ├── shareHelper.js        # Generator laporan WhatsApp
        ├── colors.js             # Design tokens / tema warna
        └── useFocusEffect.js     # Hook sederhana reload data
```

---

## 🧠 Logika Status Otomatis

```
dibayar === 0              → ⬜ Belum
0 < dibayar < tagihan      → 🟡 Nyicil
dibayar >= tagihan         → ✅ Lunas
```

Status selalu dihitung ulang saat data diperbarui. Tidak perlu input manual.

---

## 📊 Struktur Data (AsyncStorage)

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

## 🔗 Dependensi

| Library | Kegunaan |
|---------|----------|
| `expo` | SDK utama |
| `react-native` | Framework UI |
| `@react-native-async-storage/async-storage` | Penyimpanan lokal |
| `expo-linking` | Deep link ke WhatsApp |
| `expo-status-bar` | Styling status bar HP |

---

## 💡 Tips Penggunaan

- **Long-press** kartu acara untuk menghapus acara
- **Long-press** baris anggota untuk menghapus anggota
- Gunakan shortcut **+50rb / +100rb / Lunas** saat update cicilan
- Tombol **Share** otomatis mengelompokkan anggota per status

---

## 🛠️ Langkah Selanjutnya

- [ ] Dark mode dengan `useColorScheme()`
- [ ] Export laporan ke PDF dengan `expo-print`
- [ ] Foto bukti transfer dengan `expo-image-picker`
- [ ] Notifikasi pengingat dengan `expo-notifications`
- [ ] Build ke APK: `eas build --platform android`
