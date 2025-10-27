# === Base image Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Salin file manifest dulu
COPY package*.json ./

# Install semua dependencies (termasuk devDependencies)
RUN npm install && npm install -g nodemon

# Salin seluruh source code
COPY . .

# Expose port
EXPOSE 4002

# Pastikan environment untuk development
ENV NODE_ENV=development

# Jalankan app
CMD ["npm", "run", "dev"]
