# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro
`migration` |
| `npx drizzle-kit migrate` | Generate
| `npx drizzle-kit generate` | Migration Database
`seed` |
| `npx tsx src/db/seed.ts` | Init data Database
 CLI                     |

# Panduan Deploy Astro Admin Panel

## Prasyarat

- Node.js 20+
- MySQL database (production)
- VPS atau platform hosting yang support Node.js

---

## Build Project

```bash
npm run build
```

Hasil build akan ada di folder `dist/` dengan struktur:

```
dist/
├── server/
│   └── entry.mjs   ← file utama yang dijalankan
├── client/
│   └── ...         ← static assets (CSS, JS, images)
```

---

## Environment Variables

Buat file `.env` di server dengan isi:

```env
DATABASE_URL=mysql://user:password@host:3306/nama_database
SESSION_SECRET=your-secret-key-yang-panjang-dan-aman
NODE_ENV=production
PORT=3000
```

---

## Opsi 1 — VPS (DigitalOcean, Contabo, AWS EC2, Biznet Gio)

### 1. Upload file ke server

```bash
# Upload menggunakan rsync
rsync -avz dist/ package.json .env user@ip-server:/var/www/admin-panel/

# Atau menggunakan scp
scp -r dist/ package.json .env user@ip-server:/var/www/admin-panel/
```

### 2. Install dependencies di server

```bash
cd /var/www/admin-panel
npm install --production
```

### 3. Jalankan dengan PM2

```bash
# Install PM2 secara global
npm install -g pm2

# Jalankan aplikasi
pm2 start dist/server/entry.mjs --name "admin-panel"

# Simpan konfigurasi PM2
pm2 save

# Agar PM2 otomatis jalan saat server restart
pm2 startup
```

### 4. Perintah PM2 yang berguna

```bash
pm2 status              # cek status aplikasi
pm2 logs admin-panel    # lihat logs
pm2 restart admin-panel # restart aplikasi
pm2 stop admin-panel    # stop aplikasi
pm2 delete admin-panel  # hapus dari PM2
```

### 5. Setup Nginx sebagai reverse proxy (opsional)

```nginx
server {
    listen 80;
    server_name domain-kamu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Opsi 2 — Railway / Render / Fly.io

### 1. Tambahkan start script di `package.json`

```json
{
  "scripts": {
    "start": "node dist/server/entry.mjs",
    "build": "astro build"
  }
}
```

### 2. Push ke Git repository

```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

### 3. Connect ke platform

- **Railway**: import repository dari GitHub → set environment variables → deploy
- **Render**: new web service → connect repo → set build command `npm run build` → start command `npm start`
- **Fly.io**: `fly launch` → `fly deploy`

---

## Opsi 3 — Docker

### 1. Buat `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY dist/ ./dist/
COPY package.json package-lock.json ./

RUN npm install --production

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server/entry.mjs"]
```

### 2. Build dan jalankan Docker image

```bash
# Build image
docker build -t admin-panel .

# Jalankan container
docker run -d \
  --name admin-panel \
  -p 3000:3000 \
  --env-file .env \
  admin-panel
```

### 3. Dengan Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: admin_panel
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

```bash
docker-compose up -d
```

---

## Checklist Sebelum Deploy

- [ ] File `.env` sudah dikonfigurasi di server
- [ ] Database MySQL sudah dibuat dan bisa diakses
- [ ] Migration sudah dijalankan: `npx drizzle-kit migrate`
- [ ] Seed data sudah dijalankan (jika perlu): `npx tsx src/db/seed.ts`
- [ ] `npm run build` berhasil tanpa error
- [ ] Port yang digunakan tidak bentrok dengan aplikasi lain
- [ ] SSL/HTTPS sudah dikonfigurasi (untuk production)

---

## Menjalankan Migration di Production

```bash
# Jalankan migration
npx drizzle-kit migrate

# Jalankan seed (hanya pertama kali)
npx tsx src/db/seed.ts
```

---

## Troubleshooting

**Aplikasi tidak bisa start:**

```bash
# Cek logs PM2
pm2 logs admin-panel --lines 50

# Cek apakah port sudah dipakai
lsof -i :3000
```

**Database tidak bisa connect:**

```bash
# Test koneksi MySQL
mysql -u user -p -h host nama_database

# Pastikan DATABASE_URL format benar
# mysql://user:password@host:port/database
```

**Static assets tidak muncul:**

- Pastikan folder `dist/client/` ikut ter-upload ke server
- Cek konfigurasi Nginx untuk serve static files
