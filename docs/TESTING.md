# Pengujian Manual

Centang setiap butir setelah benar-benar dicoba. Isi bagian **Catatan temuan** dengan bug yang ditemukan dan cara memperbaikinya.

**Lingkungan uji:** (isi browser dan versi, contoh: Chrome 130, Windows 11)
**Tanggal uji:** (isi)

## Umum
- [ ] `npm run build` selesai tanpa error
- [ ] Link Vercel terbuka dan sama dengan versi lokal
- [ ] Loading screen: persen naik, tombol Mulai dan tombol Enter bekerja
- [ ] Pindah antar halaman lewat sidebar dan tombol `1` sampai `5`
- [ ] Refresh halaman: data tidak hilang
- [ ] Console browser (`F12`) tidak menampilkan error merah

## Tugas
- [ ] Tambah tugas dengan Enter dan tombol Tambah
- [ ] Input kosong menampilkan pesan error
- [ ] Centang dan batal centang, coretan teks beranimasi
- [ ] Centang semua tugas: konfeti muncul
- [ ] Edit lewat klik dua kali (Enter menyimpan, Esc membatalkan)
- [ ] Hapus lalu klik Urungkan sebelum 5 detik
- [ ] Deadline kemarin, hari ini, dan besok menampilkan label yang benar
- [ ] Pencarian dan filter status/kategori
- [ ] Drag and drop mengubah urutan, urutan bertahan setelah refresh

## Pomodoro
- [ ] Mulai, jeda, lanjut, reset, dan lewati
- [ ] Ubah durasi (tombol nonaktif saat timer jalan)
- [ ] Atur Fokus 1 menit: sesi selesai berbunyi, konfeti muncul, riwayat tercatat
- [ ] Pindah halaman saat timer jalan: timer tetap berjalan, sisa waktu tampil di sidebar
- [ ] Spasi memulai/menjeda, dan tidak aktif saat mengetik

## Catatan
- [ ] Buat, edit, ganti warna, sematkan, dan hapus catatan
- [ ] Catatan kosong otomatis hilang saat ditutup
- [ ] Pencarian catatan
- [ ] Esc dan klik latar menutup editor

## Statistik dan Dashboard
- [ ] Angka dan ring progres di Dashboard sesuai data tugas
- [ ] Ganti metrik dan rentang 7/30 hari, tooltip muncul saat bar disorot
- [ ] Streak bertambah setelah ada aktivitas hari ini
- [ ] Pencapaian terbuka menampilkan notifikasi

## Tampilan
- [ ] Mode gelap dan terang di semua halaman (teks tetap terbaca)
- [ ] Tiga gaya latar (Aurora, Grid, Polos) dengan tombol `B`
- [ ] Tampilan HP (lebar 375px): navigasi bawah, tidak ada konten terpotong
- [ ] Command Palette: navigasi, tambah tugas, selesaikan tugas, ekspor data
- [ ] Ekspor lalu impor data memulihkan isi yang sama

## Catatan temuan

| Bug / masalah | Cara memperbaiki | Status |
|---|---|---|
| (contoh) ... | ... | selesai |