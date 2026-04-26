import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Outlet, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Import Halaman
import Index from "./pages/Index";
import LevelPage from "./pages/LevelPage";
import FlashcardPage from "./pages/FlashcardPage";
import MaterialPage from "./pages/MaterialPage";
import ExamPages from "@/pages/ExamPages"; 
import PlannerPage from "./pages/PlannerPage";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import QuizPage from "./pages/QuizPages";
import DictionaryPage from "./pages/DictPages"; 
import MeinWegPage from "@/pages/MeinWegPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ScrollToTop from "@/components/ScrollToTop";
import AdminPage from "./pages/AdminPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";

// Import Komponen Pengumuman
import { AnnouncementDisplay } from "./components/AnnouncementDisplay";

import "./App.css";

const queryClient = new QueryClient();

// ==========================================
// 🛡️ SATPAM APLIKASI (Smart Authwall Blur)
// ==========================================
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 👇 LOGIKA PENGECUALIAN A1 👇
  // Satpam akan ngecek apakah URL saat ini adalah materi/level A1
  const isFreeAccess = location.pathname.includes("/material/A1");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-slate-400" />
      </div>
    );
  }

  // JIKA BELUM LOGIN **DAN** BUKAN MATERI A1 -> Tampilkan efek Blur + Modal
  if (!user && !isFreeAccess) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-slate-50">
        
        {/* KONTEN ASLI (Dibuat Blur) */}
        <div className="absolute inset-0 blur-[6px] opacity-40 pointer-events-none select-none overflow-hidden grayscale-[30%]">
          <Outlet />
        </div>

        {/* OVERLAY MODAL LOGIN */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/10 z-50 p-4 backdrop-blur-[2px]">
          <div className="bg-white border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 max-w-md w-full text-center rounded-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-200">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase mb-3">Akses Terbatas</h2>
            <p className="text-slate-600 font-medium mb-8 text-sm sm:text-base">
              Materi dan fitur ini eksklusif untuk member. Silakan masuk atau daftar akun gratis untuk membuka semua akses belajar!
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full font-bold h-14 text-lg border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
                <Link to="/login">Masuk ke Akun</Link>
              </Button>
              <Button asChild variant="outline" className="w-full font-bold h-14 text-lg border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all bg-yellow-300 hover:bg-yellow-400 text-foreground">
                <Link to="/register">Daftar Gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika sudah login, ATAU sedang buka A1 -> Tampilkan halaman dengan normal
  return <Outlet />;
};

const MainLayout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return (
    <div className="min-h-screen w-screen bg-background flex flex-col overflow-x-hidden">
      
      {/* HEADER (Sticky) */}
      <div className={isAdminPage ? "hidden" : "sticky top-0 z-[50] w-full"}>
         <Header />
      </div>
      
      {/* PENGUMUMAN */}
      {!isAdminPage && <AnnouncementDisplay />}
      
      {/* KONTEN UTAMA */}
      <main className="flex-1 w-full relative z-0">
        <Routes>
          {/* 🟢 ZONA PUBLIK (Benar-benar gratis & tanpa blur) */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* 🔴 ZONA PRIVAT (Akan memicu efek blur jika belum login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/level/:levelId" element={<LevelPage />} />
            <Route path="/material/:levelId" element={<MaterialPage />} />
            <Route path="/flashcard" element={<FlashcardPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/simulation/:examId" element={<ExamPages />} />
            <Route path="/quiz/:levelId" element={<QuizPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/mein-weg" element={<MeinWegPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* 404 NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SpeedInsights />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;