# Gunakan image Node.js LTS
FROM node:18-alpine

# Tentukan direktori kerja
WORKDIR /app

# Salin file package untuk cache dependency
COPY package*.json ./

# Install hanya dependencies production
RUN npm ci --only=production

# Salin seluruh source code
COPY . .

# Set environment untuk production
ENV NODE_ENV=production

# Environment variable antar service (disesuaikan)
ENV INVENTORY_URL=http://inventory-service:4001/api/inventory

# Ekspos port service
EXPOSE 5001

# (Opsional) Tambahkan healthcheck biar container terpantau sehat
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/ || exit 1

# Jalankan aplikasi
CMD ["node", "server.js"]
