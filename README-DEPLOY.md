# Jio-Farm Web Dashboard (Vercel & Netlify Ready)

Frontend dashboard admin modern berbasis **React + Vite + Tailwind CSS + shadcn/ui** untuk memantau dan mengontrol cluster Jio-Farm.

---

## 🚀 Fitur Integrasi Jio-Farm

- **Client API**: `src/lib/jio-api.ts` sudah siap terhubung ke endpoint Jio-Farm:
  - `GET /api/stats` (KPI cards: Total panel, active jio, claim links, proxy pool)
  - `GET /api/panels` (Daftar Firebase panels & status device)
  - `GET /api/links` (Link harvested Gemini & aksi claim)
  - `GET /api/logs` (Streaming log console)
  - `POST /api/control/{hunter,farm,tracker}/{start,stop}` (Cluster controls)
- **Deployment Config**:
  - `vercel.json` (SPA routing rewrites)
  - `netlify.toml` (SPA routing redirects)

---

## 🛠️ Environment Variables

Di dashboard **Vercel** atau **Netlify**, tambahkan environment variable berikut:

| Key | Value Contoh | Deskripsi |
| :--- | :--- | :--- |
| `VITE_JIO_API_URL` | `https://jio-farm.yourdomain.com` atau `https://your-app.onrender.com` | URL public endpoint backend Jio-Farm |

---

## 📦 Panduan Deploy

### 1. Deploy ke Vercel
1. Push repo / folder `jio-farm-dashboard` ke GitHub Anda.
2. Buka [Vercel Dashboard](https://vercel.com/new) -> **Add New Project** -> Pilih repository.
3. Framework Preset: **Vite**
4. Root Directory: `./` (atau `jio-farm-dashboard` jika mono-repo)
5. Environment Variables: Set `VITE_JIO_API_URL` mengarah ke backend Jio-Farm Anda.
6. Klik **Deploy**.

### 2. Deploy ke Netlify
1. Buka [Netlify Dashboard](https://app.netlify.com/) -> **Add new site** -> **Import an existing project**.
2. Hubungkan ke GitHub.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Tambahkan environment variable `VITE_JIO_API_URL`.
6. Klik **Deploy site**.
