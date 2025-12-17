import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CreditCard, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLevelsFromDB, Level } from "@/data/lessons"; 
import { useState, useEffect } from "react";
// 1. Import Auth Context
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [levels, setLevels] = useState<Level[]>([]); 
  
  // 2. Ambil data user dari AuthContext
  const { user } = useAuth();

  useEffect(() => {
    const initData = async () => {
      const data = await getLevelsFromDB();
      if (data && data.length > 0) {
        setLevels(data);
      }
    };
    initData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b-4 border-foreground bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 border-2 border-foreground bg-accent">
              <span className="font-mono text-sm">Belajar Bahasa Jerman secara Online dan Mandiri</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              DEUTSCH
              <span className="bg-foreground text-background px-4 py-2 mt-2 inline-block">
                LERNEN
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Kuasai bahasa Jerman dari level A1 hingga B2 dengan materi terstruktur, 
              flashcard interaktif, dan pelacakan progress otomatis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* LOGIKA PROTEKSI: Kalau user ada, ke materi. Kalau tidak, ke login */}
              <Link to={user ? "/material/A1" : "/login"}>
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  Mulai Belajar A1
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              
              {/* LOGIKA PROTEKSI FLASHCARD */}
              <Link to={user ? "/flashcard" : "/login"}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  Coba Flashcard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="border-b-4 border-foreground bg-secondary">
        <div className="container mx-auto px-4 py-16">
          
          <h2 className="flex flex-wrap items-center justify-center gap-3 text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-foreground text-background px-4 py-2 whitespace-nowrap">
              4 LEVEL
            </span>
            <span>PEMBELAJARAN</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((level, index) => (
              <Link
                key={level.id}
                // LOGIKA PROTEKSI LEVEL
                to={user ? `/level/${level.id}` : "/login"}
                className="group border-4 border-foreground bg-card p-6 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold bg-foreground text-background w-16 h-16 flex items-center justify-center">
                    {level.id}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{level.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{level.description}</p>
                <div className="flex items-center text-sm font-medium group-hover:underline">
                  {level.subSections.length} sub-bab
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b-4 border-foreground">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            FITUR UNGGULAN
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-foreground p-6 bg-card">
              <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Materi Lengkap</h3>
              <p className="text-muted-foreground">
                Kosakata, grammar, dialog, dan latihan dalam setiap sub-bab untuk pembelajaran komprehensif.
              </p>
            </div>
            <div className="border-4 border-foreground p-6 bg-card">
              <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center mb-4">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Flashcard Interaktif</h3>
              <p className="text-muted-foreground">
                Kartu flash dengan kata Jerman di depan dan terjemahan + contoh di belakang untuk hafalan efektif.
              </p>
            </div>
            <div className="border-4 border-foreground p-6 bg-card">
              <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center mb-4">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Pelacakan Progress</h3>
              <p className="text-muted-foreground">
                Progress tersimpan dalam akunmu. Tandai selesai tiap sub-bab dan pantau kemajuanmu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Sparkles className="mx-auto mb-6" size={48} />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Memulai Perjalanan?
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
            Buat akun. Progress tersimpan otomatis. Mulai belajar sekarang dan ketahui program yang cocok denganmu!
          </p>
          
          {/* LOGIKA PROTEKSI MEIN WEG */}
          <Link to={user ? "/mein-weg" : "/login"}>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Ketahui Programmu
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-foreground py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-mono">© 2025 DeutschLernen • Belajar Bahasa Jerman Online</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;