# Gunakan base image Node.js yang ringan dan stabil
FROM node:18-alpine

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Install dependencies (hanya yang dibutuhkan untuk production)
RUN npm install --only=production

# Salin seluruh kode project ke dalam container
COPY . .

# Pastikan folder uploads ada (kalau digunakan untuk penyimpanan file)
RUN mkdir -p uploads

# Expose port yang digunakan di server.js
EXPOSE 4001

# Jalankan aplikasi menggunakan perintah start dari package.json
CMD ["npm", "start"]
