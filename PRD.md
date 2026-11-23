# Product Requirements Document (PRD): My Duit Gw (Mobile App)

## 1. Product Overview

* **Product Name:** My Duit Gw
* **Platform:** Mobile (iOS & Android via React Native / Expo)
* **Product Type:** Personal Finance & Peer-to-Peer Loan Tracker
* **UI Language:** Strictly English (all labels, navigation, categories, and prompts)
* **Design Reference:** `~/figcraft-designs/MyDuitGw.figcraft` (Sleek Deep Dark Mode `#0A0A0A`, Bento-box cards `#161618`, `20px` border radius, minimalist neon accents).



### 1.1 Problem Statement & Objective

Pencatatan keuangan pribadi sering kali ditinggalkan pengguna karena alur input transaksi yang terlalu berbelit-belit (harus membuka halaman khusus, mengisi terlalu banyak kolom, dan antarmuka yang penuh distraksi). **My Duit Gw** hadir untuk menyelesaikan masalah tersebut dengan menghadirkan pencatatan keuangan manual ultra-cepat langsung dari kartu utama di halaman *Home*, digabungkan dengan fitur pelacakan piutang (*Debt*) yang dilengkapi bukti transfer.

---

## 2. Target Audience & User Persona

* **Primary User:** Individu/anak muda yang membutuhkan pencatatan arus kas harian (pemasukan dan pengeluaran) secara cepat dan sering meminjamkan uang ke teman/kerabat sehingga membutuhkan catatan piutang yang rapi beserta bukti transfernya.

---

## 3. Navigation & Information Architecture

Aplikasi menggunakan **Floating Bottom Navigation Pill Bar** yang konsisten di seluruh layar utama dengan **4 menu utama**:

1. **Home** (Dashboard ringkasan saldo & akses cepat input transaksi)
2. **History** (Riwayat seluruh transaksi & filter kategori arus kas)
3. **Debt** (Daftar piutang orang lain & formulir pencatatan pinjaman baru)
4. **Setting** (Pengaturan profil, preferensi mata uang, dan manajemen data lokal)

---

## 4. Functional Requirements (User Stories & Features)

### 4.1 Home Screen (Dashboard)

* **Header:** Menampilkan avatar profil pengguna di kiri, bilah pencarian (*Search*) di tengah, dan ikon notifikasi di kanan.


* **Interactive Hero Balance Card (Top Card):**
* Menampilkan total saldo bersih saat ini (`Total Income - Total Expense`).


* **Core UX Rule:** Tidak ada halaman terpisah untuk menambah transaksi. Pengguna cukup **mengetuk (tap) kartu paling atas ini** untuk memunculkan *Quick Input Bottom Sheet Modal*.




* **Bento Summary Grid:**
* **Spending Card:** Menampilkan total pengeluaran bulan berjalan disertai indikator visual *progress bar* berbentuk kapsul warna-warni berdasarkan proporsi kategori.


* **Income Card:** Menampilkan ringkasan total pemasukan bulan berjalan.


* **Cashflow Summary Card:** Menampilkan sorotan aktivitas keuangan terbaru.





### 4.2 Quick Input Transaction (Bottom Sheet Modal)

* **Trigger:** Muncul sebagai *bottom sheet overlay* saat pengguna mengetuk *Hero Balance Card* di halaman Home.
* **Input Fields:**
1. **Transaction Type (Segmented Toggle):** Pilihan antara **Income** (Pemasukan) atau **Expense** (Pengeluaran).
2. **Amount:** Input nominal angka yang diformat otomatis.
3. **Category (Strict 7 Options):** Pengguna hanya memilih dari 7 kategori berikut:
* `Kuota`
* `Shopping`
* `Food`
* `Salary`
* `Bills`
* `Game`
* `Etc`


4. **Note & Date:** Catatan singkat opsional dan tanggal transaksi (*default*: hari ini).


* **Action:** Tombol **"Save Transaction"** langsung menyimpan data ke *state* aplikasi dan memperbarui angka saldo di halaman Home secara *real-time*.

### 4.3 History Screen

* **Filter Cards (Horizontal Scroll/Row):** Pengguna dapat menyaring daftar riwayat menggunakan kartu filter interaktif:
* **All** (Semua aktivitas)
* **Income** (Riwayat pemasukan)
* **Expense** (Riwayat pengeluaran)
* **Debt List** (Riwayat pencatatan piutang)


* **Chronological List:** Transaksi dikelompokkan berdasarkan waktu (*Today, Yesterday, Earlier*) dengan ikon kategori, judul/catatan, waktu transaksi, dan nominal yang dibedakan warnanya berdasarkan jenis transaksi.

### 4.4 Debt Screen (Loan Tracker)

* **Main View (Ultra-Simple List):**
* Menampilkan ringkasan total uang yang sedang dipinjamkan (*Total Lent Out*).
* Daftar vertikal kartu minimalis yang hanya menampilkan **Nama Peminjam** (*Borrower Name*) dan **Nominal Hutang** (*Amount*) agar mudah dibaca sekilas.
* Tombol **"+ Add Debt"** di bagian atas untuk mencatat pinjaman baru.


* **Add New Debt Form (Modal):**
1. **Borrower Name:** Input teks nama orang yang meminjam uang.
2. **Amount & Time:** Input nominal pinjaman serta tanggal & waktu peminjaman.
3. **Reason:** Input teks alasan meminjam uang.
4. **Transfer Receipt:** Area unggah foto/screenshot bukti transfer dari galeri/kamera perangkat.


* **Debt Detail & Status:** Mengetuk salah satu item hutang akan membuka detail lengkap (termasuk alasan dan pratinjau foto bukti transfer) serta opsi menandai status menjadi **Paid** (Lunas).

### 4.5 Setting Screen

* Menampilkan kartu pengaturan bergaya *bento* untuk informasi profil pengguna, pilihan tampilan mata uang (`IDR` / `USD`), tombol *Reset Mock Data* (untuk fase frontend), dan informasi versi aplikasi.

---

## 5. Non-Functional Requirements

* **Visual Consistency:** Seluruh layar wajib mematuhi *design token* dari `~/figcraft-designs/MyDuitGw.figcraft` (latar belakang `#0A0A0A`, kartu `#161618`, sudut membulat `20px`, dan tipografi *sans-serif* bersih).


* **Performance & Responsiveness:** Transisi antar-tab dan buka-tutup *Bottom Sheet Modal* harus berjalan mulus (60fps) dengan penanganan *keyboard-avoiding* yang baik saat mengetik nominal.
* **Scalability (Phase 2 Readiness):** Struktur data pada *Frontend State* (`Transaction` dan `Debt` objects) dirancang menyerupai skema tabel relasional agar mudah dihubungkan ke backend (Supabase) dan Web Admin Dashboard pada tahap pengembangan berikutnya.

---

## 6. Data Model (Frontend State Structure)

```typescript
export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'Kuota' 
  | 'Shopping' 
  | 'Food' 
  | 'Salary' 
  | 'Bills' 
  | 'Game' 
  | 'Etc';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  note?: string;
  date: string; // ISO Timestamp
}

export interface Debt {
  id: string;
  borrowerName: string;
  amount: number;
  loanDate: string; // ISO Timestamp
  reason: string;
  receiptUri?: string; // Local image URI (Phase 1) -> Storage URL (Phase 2)
  status: 'unpaid' | 'paid';
}

```

---

## 7. Development Milestones

* **Phase 1 (Current — Mobile Frontend MVP):** Implementasi UI/UX sesuai file Figcraft menggunakan React Native (Expo), navigasi 4 tab, *local state management* dengan *mock data*, serta seluruh alur interaksi *Quick Input* dan *Debt Receipt Picker*.
* **Phase 2 (Backend & Cloud Sync):** Integrasi database & *storage bucket* untuk penyimpanan permanen dan sinkronisasi bukti transfer.
* **Phase 3 (Web Admin Dashboard):** Pengembangan dashboard pemantauan berbasis web untuk analitik menyeluruh.