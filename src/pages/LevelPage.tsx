import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { loadProgress, saveProgress } from "@/utils/progress";
import LessonCard from "@/components/LessonCard";
import { Button } from "@/components/ui/button";
import { useLevelData } from "@/hooks/useLevelData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const LevelPage = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const { level, loading, error } = useLevelData(levelId);
  const { user } = useAuth(); // Ambil data user yang login
  
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const levelList = ["A1", "A2", "B1", "B2"];
  const currentIndex = levelList.indexOf(levelId || "");
  const prevLevelId = currentIndex > 0 ? levelList[currentIndex - 1] : null;
  const nextLevelId = currentIndex < levelList.length - 1 ? levelList[currentIndex + 1] : null;

  // --- FETCH PROGRESS (DARI SUPABASE / LOCALSTORAGE) ---
  useEffect(() => {
    const fetchProgress = async () => {
      if (!levelId) return;

      if (user) {
        try {
          // Kalau Login, tarik dari Supabase
          const { data, error } = await supabase
            .from("user_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .not("lesson_id", "is", null); // Pastikan bukan data kosong

          if (!error && data) {
            setCompletedSet(new Set(data.map((d: any) => d.lesson_id)));
          } else {
            // Fallback ke LocalStorage misal ada error / kolom belum dibuat
            const local = loadProgress(levelId);
            setCompletedSet(new Set(Object.keys(local).filter(k => local[k] === "done")));
          }
        } catch (err) {
          const local = loadProgress(levelId);
          setCompletedSet(new Set(Object.keys(local).filter(k => local[k] === "done")));
        }
      } else {
        // Kalau belum Login (Guest buka A1), pakai LocalStorage
        const local = loadProgress(levelId);
        setCompletedSet(new Set(Object.keys(local).filter(k => local[k] === "done")));
      }
    };

    fetchProgress();
  }, [user, levelId, refreshKey]);

  // --- SAVE PROGRESS (KE SUPABASE / LOCALSTORAGE) ---
  const handleMarkComplete = async (lessonId: string) => {
    // 1. Update UI Langsung Biar Gak Lemot (Optimistic Update)
    setCompletedSet((prev) => new Set(prev).add(lessonId));
    setRefreshKey((prev) => prev + 1);

    // 2. Simpan ke Database
    if (user) {
      try {
        const { error } = await supabase
          .from("user_progress")
          .insert({ user_id: user.id, lesson_id: lessonId });
          
        if (error) {
            console.error("Gagal simpan ke database:", error);
            // Fallback
            saveProgress(levelId!, lessonId);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Fallback
      saveProgress(levelId!, lessonId);
    }
  };

  // --- TAMPILAN LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="font-bold text-slate-500 animate-pulse">Wait yaww!! Sedang menyiapkan wortschartz...</p>
      </div>
    );
  }

  // --- TAMPILAN ERROR / NOT FOUND ---
  if (error || !level) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center border-4 border-foreground p-8 rounded-xl shadow-lg max-w-md bg-white">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2">Level Tidak Ditemukan</h1>
          <p className="text-slate-600 mb-6">
            Mungkin terjadi kesalahan atau koneksi bermasalah.
            <br/><span className="text-xs text-red-400 font-mono mt-2 block">{error}</span>
          </p>
          <Link to="/">
            <Button size="lg" className="font-bold">Kembali ke Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Hitung seberapa banyak sub-section yang ID-nya ada di dalam completedSet
  const completedCount = level.subSections.filter((sub: any) => completedSet.has(sub.id)).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b-4 border-foreground bg-secondary">
        <div className="container mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-bold transition-colors"
          >
            <ArrowLeft size={18} />
            Kembali ke Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl md:text-6xl font-black bg-foreground text-background px-4 py-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                  {level.id}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-tight">{level.title}</h1>
              <p className="text-lg text-muted-foreground font-medium">{level.description}</p>
            </div>
            
            <div className="border-4 border-foreground bg-white p-6 text-center min-w-[200px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Progress Belajar</p>
              <p className="text-4xl font-black">
                {completedCount}<span className="text-slate-300">/</span>{level.subSections.length}
              </p>
              <div className="mt-4 h-3 bg-slate-100 border-2 border-foreground rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-1000 ease-out"
                  style={{
                    width: `${level.subSections.length > 0 ? (completedCount / level.subSections.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        {level.subSections.length > 0 ? (
          <div className="space-y-6">
            {level.subSections.map((subSection: any) => (
              <LessonCard
                key={subSection.id}
                levelId={level.id}
                subSection={subSection}
                isComplete={completedSet.has(subSection.id)} // 👈 Kirim status selesai
                onMarkComplete={handleMarkComplete} // 👈 Kirim fungsi bapaknya
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-4 border-dashed border-slate-300 rounded-xl">
            <p className="text-xl font-bold text-slate-400">Belum ada materi di level ini.</p>
            <p className="text-slate-400">Silakan tambahkan data melalui Database / Migrasi.</p>
          </div>
        )}
      </section>

      {/* Navigation */}
      <section className="border-t-4 border-foreground bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {prevLevelId ? (
              <Link to={`/level/${prevLevelId}`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold border-2 border-foreground bg-white shadow-sm hover:shadow-md">
                  <ArrowLeft size={18} className="mr-2" />
                  Level {prevLevelId}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextLevelId && (
              <Link to={`/level/${nextLevelId}`}>
                <Button size="lg" className="w-full sm:w-auto font-bold bg-blue-600 hover:bg-blue-700 text-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
                  Lanjut Level {nextLevelId}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LevelPage;