# Gunakan image Node.js versi LTS
FROM node:18

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json dulu untuk cache yang efisien
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Salin semua file project ke container
COPY . .

# Set environment variable (opsional tapi bagus untuk log & keamanan)
ENV NODE_ENV=production

# Ekspos port sesuai service (lihat .env)
EXPOSE 5001

# Jalankan aplikasi
CMD ["node", "server.js"]
