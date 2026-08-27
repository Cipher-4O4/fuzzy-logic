# Sistem Penilaian Kehadiran Siswa - Fuzzy Logic Mamdani

Aplikasi web untuk menilai kehadiran siswa menggunakan **Metode Fuzzy Logic Mamdani** yang sebenarnya.

## 📋 Deskripsi

Sistem ini mengimplementasikan fuzzy logic Mamdani secara lengkap untuk menentukan predikat kehadiran siswa. Berbeda dengan sistem crisp logic biasa, implementasi ini menggunakan membership functions, fuzzy rules, dan defuzzification untuk menghasilkan penilaian yang lebih natural dan fleksibel.

## 🧠 Tahapan Fuzzy Logic Mamdani

### 1. **Fuzzification**
Mengkonversi input crisp (nilai kehadiran 0-100) menjadi derajat keanggotaan fuzzy:
- **KURANG**: Trapezoid [0, 0, 40, 55]
- **CUKUP**: Triangle [40, 55, 70]
- **BAIK**: Triangle [55, 70, 85]
- **SANGAT BAIK**: Trapezoid [70, 85, 100, 100]

### 2. **Rule Evaluation**
Evaluasi aturan fuzzy:
- IF Kehadiran KURANG THEN Nilai KURANG
- IF Kehadiran CUKUP THEN Nilai CUKUP
- IF Kehadiran BAIK THEN Nilai BAIK
- IF Kehadiran SANGAT_BAIK THEN Nilai SANGAT_BAIK

### 3. **Aggregation**
Menggabungkan output dari semua aturan yang aktif menggunakan operator MAX.

### 4. **Defuzzification**
Mengkonversi output fuzzy menjadi nilai crisp menggunakan **Metode Centroid**.

## 🎯 Predikat Akhir

Berdasarkan nilai crisp hasil defuzzification:
- **≥ 85**: SANGAT BAIK (🟢 Hijau)
- **70-84**: BAIK (🔵 Biru)
- **55-69**: CUKUP (🟡 Kuning)
- **< 55**: KURANG (🔴 Merah)

## 🚀 Teknologi yang Digunakan

- **HTML5** - Struktur halaman web
- **CSS3** - Styling dengan animasi
- **Bootstrap 5** - Framework CSS untuk desain responsif
- **JavaScript (Vanilla)** - Logika fuzzy dan interaksi

## 📂 Struktur File

```
fuzzy logic/
├── index.html          # Halaman utama
├── script.js           # Logika fuzzy dan event handling
└── README.md           # Dokumentasi
```

## 💻 Cara Menggunakan

1. Buka file `index.html` di browser web
2. Masukkan nilai kehadiran siswa (0-100) di form input
3. Klik tombol "🔍 Hitung Predikat"
4. Hasil penilaian akan ditampilkan dengan predikat dan warna sesuai kriteria

## ✨ Fitur

- ✅ Input validasi untuk nilai 0-100
- ✅ Perhitungan fuzzy logic otomatis
- ✅ Tampilan hasil dengan badge berwarna
- ✅ Deskripsi detail untuk setiap predikat
- ✅ Desain responsif (mobile-friendly)
- ✅ Animasi smooth
- ✅ User-friendly interface
- ✅ Tidak memerlukan server atau database

## 📊 Tentang Fuzzy Logic

Fuzzy Logic adalah metode yang memungkinkan pengambilan keputusan berdasarkan nilai-nilai yang tidak pasti. Sistem ini mengimplementasikan **Metode Mamdani** yang merupakan salah satu metode fuzzy inference system paling populer.

**Keunggulan Fuzzy Logic:**
- Dapat menangani ketidakpastian dan ambiguitas
- Lebih natural dalam meniru cara berpikir manusia
- Nilai pada batas kategori memiliki keanggotaan ganda (misal: kehadiran 70% adalah 50% CUKUP dan 50% BAIK)
- Hasil lebih smooth, tidak ada "loncat" mendadak seperti crisp logic

**Contoh Perhitungan:**
Jika kehadiran = 70%, maka:
- μ(CUKUP) = 0.5
- μ(BAIK) = 0.5
- Sistem akan mengevaluasi kedua aturan dan menghasilkan output fuzzy
- Defuzzification menghasilkan nilai crisp final untuk menentukan predikat

## 🔧 Kustomisasi

Anda dapat menyesuaikan membership functions dengan mengedit class `FuzzyLogicSystem` di file `script.js`:

```javascript
// Contoh mengubah membership function
this.inputMF = {
    kurang: { type: 'trapezoid', points: [0, 0, 30, 50] },  // Ubah batas
    cukup: { type: 'triangle', points: [30, 55, 75] },
    // dst...
};
```

Untuk mengubah aturan fuzzy:
```javascript
this.rules = [
    { input: 'kurang', output: 'kurang' },
    // Tambah/ubah aturan sesuai kebutuhan
];
```

## 📝 Lisensi

Free to use - Proyek ini bebas digunakan untuk keperluan pendidikan dan pembelajaran.

## 👨‍💻 Pengembang

Dibuat dengan ❤️ menggunakan HTML, CSS, dan JavaScriptt

---

© 2026 Sistem Penilaian Fuzzy Logic
