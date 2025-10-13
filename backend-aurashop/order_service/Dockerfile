# Gunakan image Node.js versi LTS (lebih stabil)
FROM node:18-alpine

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json untuk cache efisien
COPY package*.json ./

# Install dependencies (tanpa devDependencies untuk production)
RUN npm ci --only=production

# Salin semua file project
COPY . .

# Set environment variable (aman & konsisten)
ENV NODE_ENV=production

# Bisa tambahkan ini untuk integrasi antar service:
# Ganti URL sesuai docker-compose service name
ENV INVENTORY_URL=http://inventory-service:4001/api/inventory

# Ekspos port (sesuai .env)
EXPOSE 5001

# Jalankan aplikasi
CMD ["node", "server.js"]
