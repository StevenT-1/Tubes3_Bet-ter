# BET-TER — Judol Detector Browser Extension

BET-TER adalah Chromium browser extension untuk mendeteksi konten yang mengandung unsur judi online pada halaman web. Ekstensi ini melakukan pencarian pola pada teks DOM dan, jika fitur OCR diaktifkan, juga membaca teks dari gambar. Konten yang terdeteksi dapat diberi highlight, diblur, serta ditampilkan statistiknya melalui popup extension.

Proyek ini dibuat untuk memenuhi Tugas Besar 3 IF2211 Strategi Algoritma.

---

## Fitur Utama

* Deteksi kata kunci judol dari teks halaman web.
* Pencarian exact matching menggunakan:

  * Knuth-Morris-Pratt (KMP)
  * Boyer-Moore (BM)
* Deteksi pola `<kata><angka>` menggunakan Regex, misalnya:

  * `SLOT99`
  * `MAXWIN234`
  * `IF2211`
  * `CS401`
  * `HTTP404`
* Fuzzy matching menggunakan Weighted Levenshtein Distance untuk mendeteksi variasi penulisan, misalnya:

  * `H0KI`
  * `sl0t`
  * `s1ot99`
  * `Gαcor999`
* Bonus algoritma:

  * Rabin-Karp
  * Aho-Corasick
* Bonus censorship:

  * Highlight teks terdeteksi
  * Blur teks terdeteksi
* Bonus OCR:

  * Membaca teks dari gambar menggunakan Tesseract.js
  * Melakukan matching terhadap teks hasil OCR
  * Melakukan blur pada gambar yang terdeteksi mengandung konten judol
* Popup realtime:

  * Total keyword ditemukan
  * Total match
  * Waktu eksekusi tiap algoritma
  * Jumlah match tiap algoritma
  * Statistik per keyword
* Tooltip custom pada teks yang terdeteksi:

  * Keyword
  * Matched text
  * Algoritma yang mendeteksi
  * Jumlah kemunculan
  * Waktu eksekusi

---

## Penjelasan Singkat Algoritma

### 1. Knuth-Morris-Pratt (KMP)

Knuth-Morris-Pratt atau KMP adalah algoritma string matching yang mencari kemunculan sebuah pattern di dalam text dengan memanfaatkan informasi dari pattern itu sendiri.

KMP membangun tabel bantuan yang disebut border table atau failure function. Tabel ini menyimpan informasi tentang panjang prefix yang juga merupakan suffix pada pattern. Dengan tabel ini, ketika terjadi mismatch, algoritma tidak perlu mengulang pencocokan dari awal, melainkan dapat langsung menggeser pattern ke posisi yang lebih tepat.

Pada extension ini, KMP digunakan untuk mencari keyword dari `keyword.txt` secara exact matching. Setiap keyword dicocokkan terhadap teks halaman web. Hasil pencarian kemudian digunakan untuk highlight, tooltip, dan statistik.

Komponen utama implementasi KMP:

* Membaca keyword dari `keyword.txt`
* Membuat border table / failure function untuk setiap keyword
* Melakukan pencocokan karakter dari kiri ke kanan
* Menggeser pattern berdasarkan border table ketika mismatch
* Menghitung jumlah comparison
* Mengembalikan daftar match beserta posisi awal dan akhir match

---

### 2. Boyer-Moore (BM)

Boyer-Moore adalah algoritma string matching yang mencocokkan pattern dari kanan ke kiri. Algoritma ini efektif karena dapat melakukan shifting lebih jauh ketika terjadi mismatch.

Pada implementasi ini, Boyer-Moore menggunakan last occurrence table. Tabel ini menyimpan posisi terakhir kemunculan setiap karakter pada pattern. Ketika terjadi mismatch, pattern dapat digeser berdasarkan posisi terakhir karakter mismatch tersebut di dalam pattern.

Pada extension ini, Boyer-Moore juga digunakan untuk mencari keyword dari `keyword.txt` secara exact matching. Hasilnya dibandingkan dengan algoritma lain melalui popup extension.

Komponen utama implementasi Boyer-Moore:

* Membaca keyword dari `keyword.txt`
* Membuat last occurrence table
* Mencocokkan pattern dari kanan ke kiri
* Melakukan shifting berdasarkan karakter mismatch
* Menghitung jumlah comparison
* Mengembalikan daftar match beserta posisi awal dan akhir match

---

### 3. Regex

Regex digunakan untuk mendeteksi pola teks yang tidak berasal dari `keyword.txt`, terutama pola `<kata><angka>`. Contoh pola yang dideteksi adalah `SLOT99`, `MAXWIN234`, `IF2211`, `CS401`, dan `HTTP404`.

Regex diperbolehkan menggunakan engine bawaan JavaScript sesuai spesifikasi tugas.

---

### 4. Weighted Levenshtein Distance

Weighted Levenshtein Distance digunakan untuk fuzzy matching. Algoritma ini menghitung jarak atau tingkat perbedaan antara keyword dan kandidat teks.

Berbeda dari Levenshtein biasa, versi weighted memberikan biaya substitusi yang lebih kecil untuk karakter yang mirip secara visual, misalnya:

* `O` dan `0`
* `I` dan `1`
* `A` dan `4`
* `S` dan `5`
* huruf Latin dan karakter Unicode yang mirip

Dengan pendekatan ini, sistem dapat mendeteksi kata yang sengaja dimanipulasi agar terlihat berbeda tetapi masih mirip secara visual.

Aturan fuzzy dibuat konservatif dan tidak ditampilkan sebagai pengaturan pengguna: kandidat diterima jika weighted distance lebih kecil dari seperempat panjang token kandidat.

---

### 5. Rabin-Karp

Rabin-Karp adalah algoritma string matching berbasis hashing. Algoritma ini menghitung hash dari pattern dan substring text. Jika nilai hash sama, maka dilakukan verifikasi karakter untuk memastikan match benar-benar valid.

Pada proyek ini, Rabin-Karp digunakan sebagai algoritma bonus dan dapat dinyalakan atau dimatikan melalui popup extension.

---

### 6. Aho-Corasick

Aho-Corasick adalah algoritma string matching untuk mencari banyak pattern sekaligus dalam satu kali traversal text. Algoritma ini membangun struktur trie dan failure link untuk berpindah antar state ketika terjadi mismatch.

Pada proyek ini, Aho-Corasick digunakan sebagai algoritma bonus dan dapat dinyalakan atau dimatikan melalui popup extension.

---

## Requirement Program

Pastikan perangkat sudah memiliki:

* Google Chrome atau browser berbasis Chromium
* Node.js versi 20.19 atau lebih baru
  Disarankan menggunakan Node.js 22
* npm
* Git

Cek versi Node.js dan npm dengan perintah:

```bash
node -v
npm -v
```

---

## Instalasi

Clone repository:

```bash
git clone https://github.com/StevenT-1/Tubes3_Bet-ter.git
```

Masuk ke folder project:

```bash
cd Tubes#_Bet-ter
```

Install dependency:

```bash
npm install
```

Apabila `package-lock.json` sudah sesuai, instalasi bersih juga dapat dilakukan dengan:

```bash
npm ci
```

---

## Build Extension

Untuk melakukan build extension, jalankan:

```bash
npm run build
```

Hasil build akan dibuat pada folder:

```text
dist/
```

Folder `dist/` adalah folder yang digunakan untuk melakukan load extension di Chrome.

---

## Cara Load Extension di Google Chrome

1. Buka Google Chrome.
2. Masuk ke halaman:

```text
chrome://extensions/
```

3. Aktifkan **Developer mode** di kanan atas.
4. Klik tombol **Load unpacked**.
5. Pilih folder:

```text
dist/
```

6. Extension BET-TER akan muncul pada daftar extension.
7. Buka halaman web yang ingin diuji.
8. Klik icon extension BET-TER.
9. Tekan tombol **Rescan** untuk melakukan scanning ulang jika diperlukan.

---

## Cara Penggunaan

### 1. Melakukan Scan

Saat popup extension dibuka, extension akan mencoba melakukan scan pada halaman aktif. Pengguna juga dapat menekan tombol **Rescan** untuk melakukan scanning ulang.

Hasil scan akan menampilkan:

* Total keyword yang ditemukan
* Total match
* Waktu eksekusi total
* Jumlah match setiap algoritma
* Statistik keyword yang terdeteksi

---

### 2. Highlight

Jika toggle **Highlight** aktif, teks yang terdeteksi akan diberi tanda visual pada halaman web.

---

### 3. Blur Teks

Jika toggle **Blurred text** aktif, teks yang terdeteksi akan diblur agar konten tidak terlihat jelas.

---

### 4. OCR Image Detection

Jika toggle **OCR image detection** aktif, extension akan mencoba membaca teks dari gambar pada halaman web menggunakan OCR. Jika teks hasil OCR mengandung unsur judol, gambar tersebut dapat diblur.

OCR dapat membutuhkan waktu lebih lama dibandingkan pencarian teks biasa karena proses pembacaan gambar lebih berat.

---

### 5. Rabin-Karp Comparison

Jika toggle **Rabin-Karp comparison** aktif, extension juga menjalankan algoritma Rabin-Karp sebagai pembanding.

---

### 6. Aho-Corasick Comparison

Jika toggle **Aho-Corasick comparison** aktif, extension juga menjalankan algoritma Aho-Corasick sebagai pembanding.

---

### 7. Tooltip

Arahkan kursor ke teks yang terdeteksi untuk melihat tooltip. Tooltip menampilkan informasi seperti:

* Keyword yang terdeteksi
* Teks yang cocok
* Algoritma yang mendeteksi
* Jumlah kemunculan
* Waktu eksekusi

---

### 8. Statistik

Tekan tombol **Statistic** pada popup untuk melihat visualisasi jumlah kemunculan keyword. Statistik ini membantu membandingkan keyword mana yang paling banyak ditemukan pada halaman.

---

### 9. Clear

Tombol **Clear** digunakan untuk menghapus highlight dan blur dari halaman aktif.

---

## Struktur Folder

Struktur utama project:

```text
Tubes3_Bet-ter/
├── dist/
├── keywords/
│   └── keyword.txt
├── public/
│   ├── manifest.json
│   ├── popup.html
│   └── ...
├── src/
│   ├── algorithms/
│   ├── background/
│   ├── content/
│   ├── matching/
│   ├── ocr/
│   ├── offscreen/
│   ├── popup/
│   └── shared/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vite.content.config.ts
├── vite.ocr-worker.config.ts
└── README.md
```

Keterangan singkat:

* `src/algorithms/` berisi implementasi algoritma pattern matching.
* `src/content/` berisi script yang berjalan pada halaman web.
* `src/popup/` berisi logic popup extension.
* `src/ocr/` berisi logic pemilihan gambar dan komunikasi OCR.
* `src/background/` berisi background service worker.
* `src/offscreen/` berisi logic OCR yang dijalankan melalui offscreen document.
* `keywords/keyword.txt` berisi daftar keyword judol.
* `dist/` berisi hasil build extension yang siap diload di Chrome.

## Author

Kelompok: `Tubes3_Bet-ter`

Anggota:

| Nama       | NIM       |
| ---------- | --------- |
| `Ishak Palentino Napitupulu` | `13524022` |
| `Steven Tan` | `13524060` |
| `Marcel Luther Sitorus` | `13524063` |

## Link Repository

```text
https://github.com/StevenT-1/Tubes3_Bet-ter
```

---

## Catatan

Seluruh algoritma string matching diimplementasikan secara mandiri tanpa menggunakan library eksternal string matching. Regex menggunakan engine JavaScript sesuai ketentuan spesifikasi tugas.
