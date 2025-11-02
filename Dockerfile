# Gunakan Node versi terbaru
FROM node:22

# Set working directory
WORKDIR /app

# Copy package file dulu biar build lebih cepat
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file project
COPY . .

RUN rm -f .env
# Build TypeScript
RUN npm run build

# Expose port aplikasi (sesuaikan dengan PORT kamu)
EXPOSE 3001

# Command untuk jalankan server
CMD ["npm", "start"]