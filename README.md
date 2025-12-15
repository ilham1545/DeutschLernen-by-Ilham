# Deutsch Journey

**Deutsch Journey** adalah aplikasi web interaktif dan komprehensif yang dirancang untuk membantu pengguna mempelajari bahasa Jerman secara terstruktur. Dibangun dengan teknologi web modern, aplikasi ini menggabungkan materi pelajaran, latihan interaktif, flashcard, dan pelacakan kemajuan pengguna secara *real-time*.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

## ✨ Fitur Utama

Aplikasi ini mencakup berbagai fitur untuk mendukung pembelajaran bahasa:

* **📚 Pembelajaran Terstruktur:** Materi dibagi berdasarkan level dan topik, tersimpan di `src/data/lessons.ts`.
* **🧠 Latihan Interaktif:**
    * **Flashcards:** Sistem kartu memori untuk menghafal kosakata (`FlashcardPage`).
    * **Kuis & Ujian:** Evaluasi pemahaman materi (`QuizPages`, `ExamPages`).
* **📖 Kamus Terintegrasi:** Fitur pencarian kata yang terhubung dengan layanan Wiktionary (`DictPages`, `useDictionary`).
* **📊 Pelacakan Progres:**
    * Dashboard pengguna yang menampilkan aktivitas belajar.
    * Sistem pelacakan level dan kemajuan program (`ProgressPage`, `MeinWegPage`).
    * Pencatatan aktivitas harian (`useActivityLog`).
* **📅 Perencanaan Belajar:** Halaman `PlannerPage` untuk mengatur jadwal belajar.
* **🔐 Otentikasi Pengguna:** Sistem Login dan Register aman menggunakan Supabase Auth (`AuthContext`).
* **🎨 Antarmuka Modern:** Desain responsif dan bersih menggunakan Tailwind CSS dan komponen Shadcn UI.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan *stack* teknologi modern untuk performa dan pengalaman pengembang yang optimal:

* **Runtime & Package Manager:** [Bun](https://bun.sh/) (Terlihat dari adanya `bun.lockb`)
* **Frontend Framework:** [React](https://react.dev/) dengan [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:**
    * [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
    * [Shadcn UI](https://ui.shadcn.com/) (Koleksi komponen UI yang dapat digunakan kembali, terlihat di `src/components/ui`)
* **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL database, Auth, & Realtime subscriptions)
* **State Management & Hooks:** React Context API & Custom Hooks.

## 📋 Prasyarat Instalasi

Sebelum memulai, pastikan Anda telah menginstal:

1.  **Node.js** (v18+) atau **Bun** (v1.0+).
2.  Akun **Supabase** untuk konfigurasi database dan otentikasi.

## 🚀 Cara Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di lingkungan lokal Anda:

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/username/deutsch-journey.git](https://github.com/username/deutsch-journey.git)
    cd deutsch-journey
    ```

2.  **Instal Dependensi**
    Menggunakan Bun (disarankan):
    ```bash
    bun install
    ```
    Atau menggunakan npm:
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables**
    Buat file `.env` di root folder dan tambahkan kredensial Supabase Anda:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Jalankan Development Server**
    ```bash
    bun run dev
    # atau
    npm run dev
    ```

5.  **Buka Aplikasi**
    Buka browser dan kunjungi `http://localhost:5173` (atau port yang ditampilkan di terminal).

## 📂 Susunan Project

Struktur folder proyek diatur agar mudah dipelihara dan berskala:

```text
src/
├── components/      # Komponen React yang dapat digunakan kembali
│   ├── ui/          # Komponen dasar UI (Button, Card, Input, dll - Shadcn UI)
│   └── ...          # Komponen spesifik (FlashCard, LessonCard, dll)
├── contexts/        # React Context (misal: AuthContext)
├── data/            # Data statis (lessons, exams, quiz, vocab)
├── hooks/           # Custom React Hooks (useDictionary, useProgress)
├── lib/             # Konfigurasi library pihak ketiga (supabase client)
├── pages/           # Halaman-halaman utama aplikasi (Routing)
├── services/        # Logika integrasi API eksternal (Wiktionary)
├── utils/           # Fungsi utilitas bantu (grammarGenerator, progress calc)
├── App.tsx          # Komponen utama & konfigurasi Router
└── main.tsx         # Entry point aplikasi
