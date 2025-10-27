# Gunakan versi Node.js terbaru dan ringan
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Salin package file
COPY package*.json ./

# Install dependencies (production-only kalau build final)
RUN npm install --production

# Salin seluruh source code
COPY . .

# Set environment variable
ENV NODE_ENV=development
ENV INVENTORY_URL=http://inventory-service:4001/api/inventory

# Expose port
EXPOSE 5001

# Tambahkan healthcheck (opsional tapi recommended)
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/ || exit 1

# Jalankan aplikasi
CMD ["npm", "start"]
