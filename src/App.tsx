import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Import Halaman
import Index from "./pages/Index";
import LevelPage from "./pages/LevelPage";
import FlashcardPage from "./pages/FlashcardPage";
import ProgressPage from "./pages/ProgressPage";
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
import ForgotPassword from "./pages/ForgotPasswordPage"

import "./App.css";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";

const queryClient = new QueryClient();

const MainLayout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return (
    // CHANGE: Pakai 'w-screen' (Viewport Width) bukan w-full biar maksa lebar monitor
    <div className="min-h-screen w-screen bg-background flex flex-col overflow-x-hidden">
      
      {/* HEADER LOGIC:
          Tetap di-render tapi di-hidden pakai CSS class saat di Admin.
          Ini mencegah "White Flash" (kedip putih) karena komponen tidak di-unmount.
      */}
      <div className={isAdminPage ? "hidden" : "sticky top-0 z-[50] w-full"}>
         <Header />
      </div>
      
      {/* KONTEN UTAMA */}
      <main className="flex-1 w-full relative z-0">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/level/:levelId" element={<LevelPage />} />
          <Route path="/flashcard" element={<FlashcardPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/material/:levelId" element={<MaterialPage />} />
          <Route path="/simulation/:examId" element={<ExamPages />} />
          <Route path="/quiz/:levelId" element={<QuizPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/mein-weg" element={<MeinWegPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          
          {/* Admin Page */}
          <Route path="/admin" element={<AdminPage />} />

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
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
      </BrowserRouter>
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;