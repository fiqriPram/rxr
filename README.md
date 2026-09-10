# TOPY - Fullstack Game & Digital Voucher Top-Up Platform

Website top-up game & voucher digital fullstack modern yang dibangun menggunakan **Next.js (App Router)**, **Bun**, **Neon Database (Serverless PostgreSQL)**, dan **Drizzle ORM**.

---

## 🚀 Fitur Utama

### 🎮 Pengguna (Storefront)
1. **Katalog Game & Pencarian Instan**:
   - Hero banner carousel interaktif dengan promo flash sale.
   - Filter kategori (*Mobile Games*, *PC Games*, *Voucher*, *Entertainment*).
   - Pencarian instan berdasarkan judul game atau developer.
   - Katalog game populer: Mobile Legends, Free Fire, Genshin Impact, Valorant, PUBG Mobile, Steam Wallet IDR, dll.
2. **Formulir Top-Up Interaktif**:
   - **Langkah 1**: Input Akun (User ID & Zone ID / Server) + **Fitur "Cek Nickname"** otomatis untuk memvalidasi nama gamer.
   - **Langkah 2**: Pemilihan Denominasi / Item (Diamond, Crystals, VP, UC, Membership) dengan tanda promo dan coret harga.
   - **Langkah 3**: Metode Pembayaran Lengkap (QRIS Realtime, E-Wallet [DANA, GoPay], Virtual Account [BCA, Mandiri, BRI], Minimarket [Alfamart]).
   - **Langkah 4**: Kontak WhatsApp & Input Kode Promo Voucher (`TOPYHEMAT` diskon 10%, `NEONBARU` diskon flat).
   - **Langkah 5**: Modal konfirmasi rincian order & tombol beli responsif.
3. **Faktur & Simulasi Pembayaran**:
   - Halaman detail invoice (`/order/[invoiceNumber]`) dengan kode QRIS dan nomor Virtual Account.
   - Tombol *copy-to-clipboard* nomor VA, invoice, dan nominal tagihan.
   - **Tombol Simulator Pembayaran ("Bayar Sekarang (Simulasi)")**: Menguji alur pembayaran secara instan yang langsung mengubah status transaksi menjadi sukses disertai efek animasi *confetti*!
4. **Lacak Pesanan (`/lacak`)**:
   - Pencarian pesanan menggunakan Nomor Faktur/Invoice.
   - Pencarian riwayat transaksi berdasarkan Nomor WhatsApp pembeli.

### 🛡️ Admin Dashboard (`/admin`)
- **Statistik & Metrik**: Total pendapatan, total order, pesanan sukses, dan pesanan pending.
- **Kelola Transaksi**: Tabel transaksi real-time dengan filter status (`ALL`, `PENDING`, `SUCCESS`, `FAILED`), fitur pencarian, dan tombol ubah status instan.
- **Katalog Game & Pembayaran**: Tinjau daftar game, slug, dan metode pembayaran aktif beserta konfigurasi biaya layanannya.
- **Status Database**: Indikator status koneksi Neon PostgreSQL & Drizzle ORM.

---

## 🛠️ Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Frontend / Fullstack**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS v4, Lucide React icons, Canvas Confetti
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit`

---

## 📦 Panduan Instalasi & Menjalankan

### 1. Klon / Masuk ke Direktori
```bash
cd /home/ayy/Desktop/project/topy
```

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Database Neon
Buat file `.env.local` (atau duplikasi dari `.env.example`):
```bash
cp .env.example .env.local
```
Isi `DATABASE_URL` dengan connection string database dari [Neon Console](https://console.neon.tech):
```env
DATABASE_URL="postgresql://username:password@ep-cool-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

> **Catatan:** TOPY dilengkapi dengan *in-memory & local fallback layer*. Jika `DATABASE_URL` belum diisi, aplikasi tetap dapat dijalankan 100% untuk demo dan pengujian lokal!

### 4. Migrasi Skema & Seeder ke Neon PostgreSQL
Jalankan perintah berikut untuk menerapkan skema tabel dan mengisi data awal game, item, metode pembayaran, serta promo:
```bash
# Push schema tabel Drizzle ke Neon
bun run db:push

# Mengisi data game, nominal item, metode bayar & kode promo
bun run db:seed
```

Untuk membuka antarmuka visual tabel database Drizzle:
```bash
bun run db:studio
```

### 5. Menjalankan Server Pengembangan
```bash
bun dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 6. Build & Jalankan Versi Produksi
```bash
bun run build
bun start
```

---

## 🗂️ Struktur Direktori Proyek

```
topy/
├── drizzle/                     # File migrasi SQL hasil generate Drizzle
├── src/
│   ├── app/
│   │   ├── admin/               # Halaman Admin Dashboard
│   │   ├── api/                 # API Routes (orders, games, check-nickname, promo, admin)
│   │   ├── lacak/               # Halaman pencarian & pelacakan pesanan
│   │   ├── order/[invoice]/     # Halaman instruksi pembayaran & QRIS simulator
│   │   ├── topup/[slug]/        # Halaman form top-up game per game
│   │   ├── layout.tsx           # Root layout dengan Navbar & Footer
│   │   ├── page.tsx             # Homepage katalog game & hero carousel
│   │   └── globals.css          # Styling gaming/dark theme & neon effects
│   ├── components/              # Komponen reusable (Navbar, Footer, HeroBanner, TopUpForm, GameGrid, GameCard, Modal)
│   ├── db/
│   │   ├── index.ts             # Inisialisasi client Neon & Drizzle
│   │   ├── schema.ts            # Skema PostgreSQL (categories, games, items, paymentMethods, transactions, promoCodes)
│   │   ├── repo.ts              # Repository query database dengan fallback
│   │   └── seed.ts              # Seeder data awal ke Neon
│   └── lib/
│       ├── mock-data.ts         # Data awal katalog game & store
│       └── utils.ts             # Helper format Rupiah, invoice generator, fee calculation
├── drizzle.config.ts            # Konfigurasi Drizzle Kit
├── package.json
└── tailwind.config.ts
```

---

## 🎟️ Kode Promo Bawaan untuk Uji Coba

- `TOPYHEMAT`: Diskon 10% (maksimal Rp 15.000)
- `NEONBARU`: Potongan langsung Rp 5.000 (minimal transaksi Rp 25.000)
- `SULTANVIP`: Diskon 15% (maksimal Rp 30.000 untuk transaksi di atas Rp 100.000)
