# 🛍️ AuraTeaShop Microservices System

## 👥 Anggota Kelompok
| Nama | Peran | Tugas |
|------|--------|-------|
| [ Ezekiel Griffin Dave (42230011) ] | Backend Developer | Order Service|
| [ Willybrodus Stephanus Da Costa(42230015) ] | Backend Developer | Inventory Service |
| [ I Nyoman Rizky Anggika (42230052) ] | Frontend Developer | Web Frontend (Vite + React) |
| [ I GustiNathanAgungTanaka (42230038) ] | Backend Developer | Cashier Service |


---

## 🎯 Tema Aplikasi
**Tema:** *Kasir dan Manajemen Toko Teh Berbasis Microservices*  
Aplikasi ini dikembangkan untuk membantu pengelolaan pesanan, inventori produk, dan transaksi kasir dalam satu ekosistem modular berbasis **Node.js + Express + MySQL + Docker**.

---

## 📦 Deskripsi Singkat Proyek

AuraTeaShop merupakan sistem berbasis **microservices** yang terdiri dari beberapa komponen utama:

| Service | Port | Deskripsi |
|----------|------|-----------|
| 🟩 Frontend | `5173` | Antarmuka web untuk kasir & admin toko |
| 🟦 Inventory Service | `4001` | Mengelola data produk dan stok |
| 🟧 Order Service | `5001` | Mencatat pesanan dan status pembayaran |
| 🟨 Cashier Service | `4002` | Menangani transaksi pembayaran pesanan |
| 🧩 MySQL Database | `3306` | Penyimpanan data terpusat (container) |

Setiap service dikemas terpisah menggunakan **Docker** dan berkomunikasi melalui API REST menggunakan jaringan internal Docker (`auranet`).

---

## 🚀 Cara Menjalankan Proyek

### 1️⃣ Persiapan Awal
Pastikan sudah terinstall:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Git (opsional untuk clone repo)

### 2️⃣ Clone Repository
```bash
git clone https://github.com/username/aurashop-microservices.git
cd aurashop-microservices
```

### 3️⃣ Jalankan Semua Service
```
docker compose up --build
```
Tunggu proses selesai. Jika berhasil, akan muncul log seperti:
```
✅ MySQL Pool connected to database
🚀 Order Service running on port 5001
🚀 Inventory Service running on port 4001
🚀 Cashier Service running on port 4002
VITE v5.0  ready in 1500ms
```
### 4️⃣ Akses Aplikasi

Frontend (React): http://localhost:5173

Inventory API: http://localhost:4001/api/inventory

Order API: http://localhost:5001/api/orders

Cashier API: http://localhost:4002/api/payments

Database (MySQL): localhost:3306 user:root, pass:root

### 5️⃣ (Opsional) Jalankan di Background
```
docker compose up -d
```
