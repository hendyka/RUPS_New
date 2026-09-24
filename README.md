# 📅 Kalkulator Timeline & Jadwal RUPS (POJK 15/POJK.04/2020)

[![Live Demo](https://img.shields.io/badge/Demo-rups--new.vercel.app-blue?style=for-the-badge&logo=vercel)](https://rups-new.vercel.app/)
[![POJK Compliance](https://img.shields.io/badge/POJK-15%2FPOJK.04%2F2020-green?style=for-the-badge)](https://www.ojk.go.id)

Aplikasi web untuk menghitung dan mensimulasikan **Timeline & Jadwal Rangkaian Tahapan RUPS** (Rapat Umum Pemegang Saham) Perusahaan Terbuka (Tbk) secara otomatis dan akurat sesuai ketentuan **POJK No. 15/POJK.04/2020**.

Live Application: [https://rups-new.vercel.app/](https://rups-new.vercel.app/)

---

## 📌 Latar Belakang & Masalah

Penentuan jadwal RUPS Perusahaan Terbuka membutuhkan kecermatan tinggi karena harus mematuhi batas waktu (*deadline*) ketat yang diatur oleh OJK. Tantangan utama dalam penyusunan jadwal RUPS meliputi:

1. **Aturan Perhitungan Hari yang Berbeda:** Penggabungan hitungan **Hari Kerja** (tidak menghitung akhir pekan & libur nasional) dan **Hari Kalender**.
2. **Kaidah Non-Inclusive Date:** Aturan POJK di mana tanggal pengumuman/pemanggilan dan tanggal pelaksanaan **tidak ikut dihitung** dalam rentang hari minimum.
3. **Risiko Sanksi Regulasi:** Keterlambatan satu hari saja pada tahap pemberitahuan atau pemanggilan dapat menyebabkan RUPS batal demi hukum atau terkena sanksi administratif dari OJK.

Aplikasi ini hadir sebagai solusi otomatis untuk membantu *Corporate Secretary*, Tim Legal, Notaris, dan Praktisi Pasar Modal dalam merencanakan jadwal RUPS dengan cepat, presisi, dan patuh regulasi.

---

## 🚀 Fitur Utama

* 🎯 **Hitung Mundur & Maju Otomatis:** Tentukan tanggal target Pelaksanaan RUPS, dan sistem akan mengalkulasi seluruh tanggal *milestone* secara otomatis (atau sebaliknya).
* 📆 **Kalender Hari Kerja & Libur Nasional:** Memperhitungkan Sabtu/Minggu serta Hari Libur Nasional / Cuti Bersama dalam kalkulasi hari kerja.
* 📋 **Peta Timeline Lengkap (Pasal POJK 15):**
  * Pemberitahuan Rencana RUPS ke OJK
  * Pengumuman RUPS
  * *Recording Date* (Daftar Pemegang Saham / DPS yang Berhak Hadir)
  * Pemanggilan RUPS
  * Pelaksanaan RUPS
  * Pengumuman Ringkasan Risalah RUPS
  * Penyampaian Akta Risalah RUPS ke OJK
* ⚠️ **Peringatan Batas Waktu (*Deadline Alert*):** Menandai batas tanggal kritis yang tidak boleh terlewat.
* 📤 **Ekspor & Cetak Jadwal:** Simpan dan bagikan jadwal RUPS dalam format ringkas untuk keperluan koordinasi internal, Direksi, Notaris, maupun OJK.

---

## 📊 Matriks Ketentuan Waktu RUPS (POJK 15/POJK.04/2020)

| Tahapan / Tahap Kegiatan | Pasal POJK | Acuan & Ketentuan Waktu Minimum / Maksimum | Jenis Hari |
| :--- | :---: | :--- | :---: |
| **Pemberitahuan Rencana RUPS ke OJK** | Pasal 22 | Maksimal $5$ hari kerja sebelum Pengumuman RUPS | **Hari Kerja** |
| **Pengumuman RUPS** | Pasal 14 | Minimum $14$ hari sebelum Pemanggilan RUPS *(tgl pengumuman & pemanggilan tidak dihitung)* | **Hari Kalender** |
| **Penetapan DPS (*Recording Date*)** | Pasal 19 | Minimum $1$ hari kerja sebelum Pemanggilan RUPS atau pada hari Pemanggilan | **Hari Kerja** |
| **Pemanggilan RUPS** | Pasal 16 | Minimum $21$ hari sebelum Pelaksanaan RUPS *(tgl pemanggilan & pelaksanaan tidak dihitung)* | **Hari Kalender** |
| **Pelaksanaan RUPS** | - | **Tanggal Utama (D-Day)** | - |
| **Pengumuman Ringkasan Risalah RUPS** | Pasal 51 | Maksimal $2$ hari kerja setelah Pelaksanaan RUPS | **Hari Kerja** |
| **Penyampaian Akta Risalah RUPS ke OJK**| Pasal 53 | Maksimal $30$ hari setelah Pelaksanaan RUPS | **Hari Kalender** |

---

## 🧮 Logika Perhitungan Tanggal

Secara matematis, penentuan tanggal $T$ dihitung berdasarkan jenis hari yang berlaku pada pasal terkait:

1. **Hitungan Hari Kalender (Non-Inclusive):**
   $$T_{\text{Pemanggilan}} \le T_{\text{Pelaksanaan}} - 22 \text{ hari kalender}$$
   *(Minimum selisih $21$ hari bersih di luar tanggal pemanggilan dan pelaksanaan)*

2. **Hitungan Hari Kerja:**
   $$T_{\text{Pemberitahuan OJK}} \le T_{\text{Pengumuman}} - 5 \text{ hari kerja}$$
   *(Sabtu, Minggu, dan Hari Libur Nasional diabaikan dalam penjumlahan)*

---

## 🔄 Flowchart Alur Timeline RUPS

```text
[ Input: Tanggal Pelaksanaan RUPS ]
                 │
                 ▼
 ┌───────────────────────────────┐
 │   Kalkulasi Hitung Mundur     │
 └───────────────┬───────────────┘
                 │
                 ├─► Pemberitahuan ke OJK (H-5 Hari Kerja dari Pengumuman)
                 │
                 ├─► Pengumuman RUPS (H-14 Hari Kalender dari Pemanggilan)
                 │
                 ├─► Recording Date / DPS (H-1 Hari Kerja dari Pemanggilan)
                 │
                 ├─► Pemanggilan RUPS (H-21 Hari Kalender dari Pelaksanaan)
                 │
                 ▼
     [ 🎯 PELAKSANAAN RUPS ]
                 │
                 ├─► Ringkasan Risalah RUPS (H+2 Hari Kerja)
                 │
                 └─► Akta Risalah RUPS ke OJK (H+30 Hari Kalender)
```

---

## 💻 Cara Menjalankan Project Secara Lokal

### Prasyarat

* [Node.js](https://nodejs.org/) (v16.x atau yang lebih baru)
* `npm` atau `yarn` / `pnpm`

### Langkah-Langkah

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/hendyka/RUPS_New.git
   cd RUPS_New
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🛠️ Teknologi yang Digunakan

* **Framework:** [Next.js](https://nextjs.org/) / React
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Deployment:** [Vercel](https://vercel.com/)

---

## 🤝 Kontribusi

Aplikasi ini terbuka untuk pengembangan lebih lanjut (seperti integrasi API Kalender Libur Nasional otomatis, ekspor ke PDF/iCal, dsb.).

1. Fork repositori ini
2. Buat branch fitur baru (`git checkout -b feature/FiturBaru`)
3. Commit perubahan (`git commit -m 'Tambah Fitur Baru'`)
4. Push ke branch (`git push origin feature/FiturBaru`)
5. Buka **Pull Request**

---

## 📄 Lisensi

Distributed under the **MIT License**. Lihat `LICENSE` untuk informasi lebih lanjut.

## 👤 Pengembang & Kontak

* **Developer:** [Hendika Darma Listianto](https://www.linkedin.com/in/hendika-listianto-706b27352/)
* **GitHub:** [@hendyka](https://github.com/hendyka)
* **Web App:** [https://rups-new.vercel.app/](https://rups-new.vercel.app/)
