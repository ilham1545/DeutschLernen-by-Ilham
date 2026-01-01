import { Link } from "react-router-dom";
import { 
  ArrowRight, BookOpen, CreditCard, BarChart3, Sparkles, 
  Heart, Code, Coffee, Github, Instagram, Linkedin, Star, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLevelsFromDB, Level } from "@/data/lessons"; 
import { useState, useEffect } from "react";
// 1. Import Auth Context
import { useAuth } from "@/contexts/AuthContext";
// 2. Import Dialog Components untuk Footer
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card"; // Tambahan untuk layout yang lebih rapi (opsional, tapi saya pakai biar sesuai style footer)

const Index = () => {
  const [levels, setLevels] = useState<Level[]>([]); 
  
  // 2. Ambil data user dari AuthContext
  const { user } = useAuth();

  // 3. State untuk Footer Modals
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-background">
      
      {/* --- HERO SECTION --- */}
      <section className="border-b-4 border-foreground bg-background relative overflow-hidden">
        {/* Dekorasi Background Halus */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none opacity-50">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40 mix-blend-multiply"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-100 rounded-full blur-3xl opacity-40 mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-8 px-4 py-2 border-2 border-foreground bg-accent shadow-sm">
              <span className="font-mono text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-600"/> Belajar Bahasa Jerman Online & Mandiri
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
              DEUTSCH
              <span className="bg-foreground text-background px-4 py-1 mt-2 inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                LERNEN
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Kuasai bahasa Jerman dari level <b>A1 hingga B2</b> dengan materi terstruktur, 
              flashcard interaktif, dan pelacakan progress otomatis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* LOGIKA PROTEKSI: Kalau user ada, ke materi. Kalau tidak, ke login */}
              <Link to={user ? "/material/A1" : "/login"}>
                <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black">
                  Mulai Belajar A1
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              
              {/* LOGIKA PROTEKSI FLASHCARD */}
              <Link to={user ? "/flashcard" : "/login"}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 h-14 rounded-xl border-2 border-black hover:bg-slate-100">
                  Coba Flashcard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- LEVELS SECTION --- */}
      <section className="border-b-4 border-foreground bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          
          <h2 className="flex flex-wrap items-center justify-center gap-3 text-3xl md:text-5xl font-black text-center mb-16 tracking-tight">
            <span className="bg-foreground text-background px-4 py-2 whitespace-nowrap transform rotate-1">
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
                className="group relative border-4 border-foreground bg-card p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl font-black bg-foreground text-background w-16 h-16 flex items-center justify-center rounded-lg shadow-sm">
                    {level.id}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{level.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{level.description}</p>
                <div className="flex items-center text-sm font-bold group-hover:underline decoration-2 underline-offset-4">
                  {level.subSections.length} Kategori Kosakata Tersedia
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="border-b-4 border-foreground py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight">
            FITUR UNGGULAN
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-foreground p-8 bg-card rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 border-2 border-foreground flex items-center justify-center mb-6 rounded-xl">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Materi Terstruktur</h3>
              <p className="text-muted-foreground leading-relaxed">
                Kurikulum lengkap dari kosakata, grammar, hingga percakapan sehari-hari yang disusun rapi.
              </p>
            </div>
            <div className="border-4 border-foreground p-8 bg-card rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-600 border-2 border-foreground flex items-center justify-center mb-6 rounded-xl">
                <CreditCard size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Flashcard Pintar</h3>
              <p className="text-muted-foreground leading-relaxed">
                Hafalkan ribuan kosakata dengan metode flashcard interaktif yang terbukti efektif.
              </p>
            </div>
            <div className="border-4 border-foreground p-8 bg-card rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-14 h-14 bg-green-100 text-green-600 border-2 border-foreground flex items-center justify-center mb-6 rounded-xl">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Pantau Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                Setiap bab yang selesai akan tersimpan otomatis. Lihat seberapa jauh kamu melangkah!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="bg-foreground text-background py-24 relative overflow-hidden">
        {/* Dekorasi Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Sparkles className="mx-auto mb-6 text-yellow-400 animate-pulse" size={56} />
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Siap Memulai Perjalananmu?
          </h2>
          <p className="text-xl opacity-80 mb-10 max-w-xl mx-auto leading-relaxed">
            Buat akun gratis sekarang. Simpan progress belajarmu dan temukan program yang cocok untukmu!
          </p>
          
          {/* LOGIKA PROTEKSI MEIN WEG */}
          <Link to={user ? "/mein-weg" : "/login"}>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-xl font-bold hover:scale-105 transition-transform">
              Ketahui Programmu
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER INTEGRATED (DARK MODE & POPUP) ==================== */}
      <footer className="bg-slate-950 text-slate-300 py-16 relative overflow-hidden mt-auto border-t-8 border-indigo-600">
        <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            
            {/* BAGIAN KIRI: Branding */}
            <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-white tracking-tighter mb-3">
                Deutsch<span className="text-indigo-500">Lernen</span>.
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto md:mx-0 leading-relaxed">
                Platform belajar bahasa Jerman yang interaktif, modern, dan gratis untuk semua pejuang masa depan.
                </p>
            </div>

            {/* BAGIAN KANAN: Tombol Interaktif */}
            <div className="flex flex-wrap justify-center gap-4">
                
                {/* Tombol About Owner */}
                <Button 
                variant="outline" 
                onClick={() => setIsAboutOpen(true)}
                className="h-12 px-6 bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-indigo-500 transition-all rounded-full"
                >
                <Code className="w-4 h-4 mr-2" /> Developer
                </Button>

                {/* Tombol Credits/Thanks */}
                <Button 
                variant="outline" 
                onClick={() => setIsCreditsOpen(true)}
                className="h-12 px-6 bg-transparent border-slate-800 text-slate-400 hover:text-pink-500 hover:bg-slate-900 hover:border-pink-500 transition-all rounded-full group"
                >
                <Heart className="w-4 h-4 mr-2 group-hover:fill-pink-500 transition-colors" /> Credits
                </Button>
            </div>
            </div>

            {/* COPYRIGHT BAWAH */}
            <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 gap-4">
            <p className="font-mono">&copy; {new Date().getFullYear()} DeutschLernen. All rights reserved.</p>
            <div className="flex items-center gap-1 font-medium bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-1 animate-pulse" /> in Kuningan, Jawa Barat.
            </div>
            </div>
        </div>
      </footer>

      {/* ================= MODAL 1: ABOUT DEVELOPER ================= */}
      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden z-[99999]">
          {/* Header Gambar/Gradient */}
          <div className="h-36 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative">
             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <Avatar className="w-28 h-28 border-[6px] border-white shadow-xl bg-white">
                    {/* GANTI FOTO DISINI */}
                    <AvatarImage src="/ilham.jpeg" className="object-cover" /> 
                    <AvatarFallback className="bg-slate-900 text-white font-bold text-2xl">IR</AvatarFallback>
                </Avatar>
             </div>
          </div>
          
          <div className="pt-16 pb-10 px-8 text-center">
             <DialogTitle className="text-3xl font-black text-slate-900 mb-1">Ilham Ramdhani</DialogTitle>
             <div className="flex justify-center items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Prompt Engineer & SPV</span>
             </div>
             
             <p className="text-slate-600 text-sm leading-relaxed mb-8">
               Itu gatau juga ya mau nyebut diri sendiri 'Full Stack Developer' juga ngga banyak ngoding manual hahaha. Jadinya ya udah deh gitu aja :D. Asli dari <b>Kuningan, Jawa Barat</b>. 
               Membangun website ini dengan sepenuh hati untuk membantu teman-teman belajar bahasa Jerman tanpa ribet.
             </p>

             <div className="grid grid-cols-2 gap-3">
                <a href="https://instagram.com/ilham_1545" className="w-full"><Button variant="outline" className="w-full gap-2 rounded-xl h-12 hover:bg-slate-50 border-slate-200 text-slate-600"><Instagram className="w-4 h-4 text-pink-600"/> Instagram</Button></a>
                <a href="https://linkedin.com/in/muhammad-ilham-ramdhani" className="w-full"><Button variant="outline" className="w-full gap-2 rounded-xl h-12 hover:bg-slate-50 border-slate-200 text-slate-600"><Linkedin className="w-4 h-4 text-blue-700"/> LinkedIn</Button></a>
                <a href="https://github.com/ilham1545" className="col-span-2 w-full"><Button className="w-full gap-2 rounded-xl h-12 bg-slate-900 hover:bg-slate-800 text-white"><Github className="w-4 h-4"/> Lihat Github Saya</Button></a>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 2: CREDITS / TERIMA KASIH ================= */}
      <Dialog open={isCreditsOpen} onOpenChange={setIsCreditsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-none shadow-2xl p-8 z-[99999]">
          <DialogHeader className="mb-6 text-center">
            <div className="w-16 h-16 bg-pink-50 rounded-3xl flex items-center justify-center mb-4 mx-auto border-2 border-pink-100">
                <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-bounce" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Terima Kasih!</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
                Website ini tidak akan terwujud tanpa bantuan teknologi open-source yang luar biasa ini:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
             {[
                 { name: "React & Vite", role: "Frontend Engine", color: "bg-blue-50 text-blue-600" },
                 { name: "Tailwind CSS", role: "Styling System", color: "bg-cyan-50 text-cyan-600" },
                 { name: "Shadcn/UI", role: "Component Library", color: "bg-slate-100 text-slate-600" },
                 { name: "Supabase", role: "Backend & DB", color: "bg-green-50 text-green-600" },
                  { name: "Gemini AI", role: "AI GACORR", color: "bg-yellow-50 text-yellow-600" },
             ].map((tech, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <span className="font-bold text-slate-700 text-sm">{tech.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${tech.color}`}>{tech.role}</span>
                 </div>
             ))}
          </div>

          <div className="text-center pt-6 mt-2 border-t border-slate-100">
             <p className="text-xs text-slate-400 mb-4">
                Dan terima kasih khusus untuk kamu yang sudah mampir!
             </p>
              <Button asChild className="w-full rounded-2xl h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/20 border-0 font-bold">
                <a href="https://sociabuzz.com/ilhamramdhani/tribe" target="_blank" rel="noopener noreferrer">
                  <Coffee className="w-4 h-4 mr-2"/> 
                  Traktir Saya Kopi
                </a>
              </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Index;