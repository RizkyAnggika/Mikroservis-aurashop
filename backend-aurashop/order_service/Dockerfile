# Gunakan Node.js versi LTS (stabil)
FROM node:18

# Tentukan working directory di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json dulu (biar cache build efisien)
COPY package*.json ./

# Install dependency
RUN npm install

# Salin semua file project ke container
COPY . .

# Tentukan port yang digunakan
EXPOSE 5000

# Jalankan aplikasi
CMD ["npm", "start"]
