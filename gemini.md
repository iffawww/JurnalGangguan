Spesifikasi Proyek: SIM-GPD (Sistem Monitoring Gangguan & Pelaporan Digital) PLN UP3 Madura

 1. Deskripsi Proyek
Aplikasi web full-stack untuk mendigitalkan pencatatan gangguan jaringan dari Excel dan WhatsApp ke dalam satu platform terpusat. Aplikasi ini mempermudah input jurnal harian, manajemen arsip foto eviden yang ringan, dan otomatisasi pembuatan laporan PPT evaluasi harian atau mingguan yang estetis serta hemat penyimpanan.

 

 3. Aksesibilitas & UI/UX Estetik
- Sistem Terbuka: Tidak menggunakan sistem login aktor (No Admin/User roles) untuk mempercepat akses operasional.
- Visual Design: Menggunakan Background Abstract Gradient Waves (Gradasi bergelombang) dengan perpaduan warna Biru Tua, Biru Muda, dan aksen Kuning sesuai identitas PLN namun tetap modern dan segar.
- Layout bersifat 100% Responsive, beradaptasi dari tampilan Card-based di mobile hingga Dashboard luas di desktop.
- Branding: Penempatan Logo PLN wajib ada pada Header aplikasi dan setiap slide laporan PPT.

 4. Struktur Data Input (Form Operasional)
Setiap data gangguan yang diinput mencakup kolom berikut:
1. Nomor: Urutan gangguan per tanggal kejadian.
2. ULP: Pilihan dropdown 10 unit ULP (Bangkalan, Kamal, Blega, Sampang, Ketapang, Waru, Pamekasan, Sumenep, Ambunten, Arjasa).
3. GI (Gardu Induk): Nama lokasi Gardu Induk terkait.
4. Penyulang: Nama penyulang yang mengalami trip.
5. Nama Proteksi: Alat proteksi yang bekerja (misal: REC, PMT, PMCB).
6. Kode J: ID unik laporan gangguan.
7. TGL Trip: Tanggal kejadian gangguan.
8. Rele Kerja: Jenis rele yang bekerja (OCR, DGR atau --).
9. Cuaca: Kondisi cuaca (Cerah, Hujan, Mendung, Petir).
10. T/P: Status Trip atau Permanent.
11. Keterangan: Detail penyebab gangguan (misal: Pohon tumbang, Ular, dll).
12. Eviden Foto (Sebelum & Sesudah): Maksimal 2 foto, bersifat opsional (bisa diunggah menyusul).

 5. Fitur Utama & Alur Bisnis
- Optimasi Storage (300 KB): WAJIB menerapkan Client-Side Image Compression. Setiap foto yang diunggah akan dikompres otomatis menjadi maksimal 300 KB (format WebP/JPEG) sebelum dikirim ke database.
- Sistem Jurnal Fleksibel: Data teks dapat disimpan terlebih dahulu meskipun foto eviden belum tersedia dari lapangan.
- Otomatisasi PPT (Daily Aggregated): Fitur Generate PPT akan mengelompokkan data berdasarkan Tanggal Trip.
- Satu Slide = Satu Tanggal: Berisi tabel data standar (Penyulang s/d Keterangan) di bagian atas dan Grid Foto Eviden yang rapi di bagian bawah slide.
- Urutan foto pada grid otomatis sinkron dengan nomor urut pada tabel laporan.

 6. Database Schema (Placeholder)
- Tabel Jurnal_Gangguan: ID (Primary Key), No_Urut, ULP, GI, Penyulang, Proteksi, Kode_J, Tgl_Trip, Rele, Cuaca, Status_TP, Keterangan, Path_Foto_1, Path_Foto_2, Created_At.