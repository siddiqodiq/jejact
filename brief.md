# Project Brief — Jejact

Buat aplikasi web bernama **Jejact**, yaitu platform yang memungkinkan pengguna menghubungkan akun Strava, memilih aktivitas olahraga, lalu mengubah statistik aktivitas tersebut menjadi **stiker visual transparan** yang dapat disalin atau diunduh untuk ditempel ke Instagram Story.

## Core Flow

1. User membuka Jejact.
2. Login / connect menggunakan Strava OAuth.
3. Tampilkan daftar aktivitas terbaru dari Strava.
4. User memilih satu aktivitas.
5. Masuk ke Sticker Editor.
6. User memilih template stiker.
7. User dapat memilih statistik yang ingin ditampilkan:

   * Distance
   * Pace
   * Duration
   * Elevation
   * Heart Rate
   * Calories, jika tersedia
8. Tampilkan live preview.
9. Export sebagai PNG transparan.
10. Sediakan aksi:

* Copy Sticker
* Download PNG
* Share jika browser mendukung

## UI / UX Direction

Gunakan nuansa visual yang terinspirasi dari **macOS dan iOS modern**, tetapi tetap memiliki identitas Jejact sendiri.

Karakter UI:

* Minimal
* Premium
* Clean
* Soft
* Banyak whitespace
* Mobile-first
* Tidak terlihat seperti dashboard SaaS generik
* Hindari penggunaan gradient berlebihan
* Hindari terlalu banyak card dan border

Gunakan:

* Font: **Inter** atau **Geist**, dengan typography yang menyerupai karakter San Francisco / Apple UI
* Rounded corners sekitar 14–24px
* Soft shadow
* Subtle border
* Translucent surface / glass effect secukupnya
* Smooth transition dan micro-interaction
* Bottom sheet pada mobile
* Segmented control ala iOS
* Modal dan popover yang ringan
* Navigation sederhana

Color direction:

* Background utama: off-white / light gray
* Surface: white dengan sedikit transparency
* Text utama: near-black
* Secondary text: neutral gray
* Accent color Jejact: gunakan satu warna aksen yang elegan dan konsisten
* Siapkan dark mode

## Suggested Tech Stack

Gunakan monorepo dengan struktur yang mudah diskalakan.

* Frontend: Next.js + TypeScript
* Styling: Tailwind CSS
* UI primitives: shadcn/ui + Radix UI
* Sticker canvas: Konva.js / react-konva
* Backend API: NestJS
* Database: Supabase PostgreSQL
* ORM: Prisma
* Authentication: Strava OAuth
* Cache dan queue: Redis + BullMQ, tetapi siapkan secara modular dan tidak perlu dipaksakan pada MVP
* Storage: Supabase Storage untuk MVP, dengan struktur yang mudah dipindahkan ke object storage lain
* Validation: Zod
* Package manager: pnpm
* Monorepo: Turborepo

## Architecture

Gunakan pendekatan **modular monolith**, bukan microservices.

Struktur awal:

```text
jejact/
├── apps/
│   ├── web/          # Next.js
│   ├── api/          # NestJS
│   └── worker/       # Background jobs
├── packages/
│   ├── database/
│   ├── types/
│   ├── validation/
│   ├── sticker-engine/
│   └── config/

```

Pisahkan frontend, API, dan worker agar mudah melakukan horizontal scaling di masa depan.

## Database Entities

Minimal siapkan:

* users
* strava_connections
* activities
* templates
* saved_designs
* exports

Token Strava harus disimpan secara aman dan terenkripsi. Jangan expose access token atau refresh token ke frontend.

## Sticker Engine

Utamakan rendering di sisi client untuk mengurangi beban server.

Gunakan:

* HTML Canvas
* Konva.js / react-konva
* Template berbasis JSON
* Transparent background
* High-resolution PNG export

Contoh struktur template:

```json
{
  "id": "minimal-distance",
  "name": "Minimal Distance",
  "width": 1080,
  "height": 500,
  "elements": [
    {
      "type": "text",
      "field": "distance",
      "x": 80,
      "y": 80,
      "fontSize": 120,
      "fontWeight": 700
    }
  ]
}
```

Template harus dapat menerima dynamic data dari aktivitas Strava tanpa hard-code layout per aktivitas.

## Main Pages

Buat minimal:

* Landing Page
* Connect with Strava
* Dashboard / Recent Activities
* Activity Detail
* Sticker Studio
* Template Gallery
* User Settings

## MVP Priority

Fokus pertama:

* Strava OAuth
* Fetch recent activities
* Activity selection
* 5–6 sticker templates
* Live sticker preview
* Toggle statistics
* Change text color
* Transparent PNG
* Copy sticker
* Download PNG
* Responsive mobile UI

Jangan membuat editor kompleks seperti Canva pada tahap awal. Gunakan template terkontrol terlebih dahulu.

## Engineering Requirements

* Clean architecture
* Strong TypeScript typing
* Reusable components
* Environment-based configuration
* Secure token handling
* Responsive design
* Accessible UI
* Loading skeleton
* Empty states
* Error states
* Rate-limit aware untuk Strava API
* Cache aktivitas agar tidak memanggil Strava API setiap refresh
* Hindari overengineering

Mulai dengan membuat:

1. Struktur monorepo.
2. Database schema.
3. Environment variables.
4. UI design system Jejact.
5. Landing page.
6. Strava OAuth flow.
7. Dashboard activity.
8. Sticker Studio MVP.

Pastikan hasil visual terasa seperti aplikasi consumer premium dengan kualitas UI setara aplikasi modern di ekosistem Apple, bukan admin dashboard atau template SaaS generik.
