import { useState, useEffect } from "react";
// 1. Ganti Import: Gunakan fungsi DB
import { getLevelsFromDB, Level } from "@/data/lessons";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Tambah Input untuk link
import { Textarea } from "@/components/ui/textarea"; // Tambah Textarea untuk note
import {
  Calendar, CheckCircle2, Target, Clock,
  Youtube, ExternalLink, BookOpen, Coffee, GraduationCap,
  Headphones, FileText, Globe, RefreshCcw, Sparkles,
  ChevronDown, ChevronUp, Info, PenTool, AlertTriangle, Circle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

// --- DATABASE SUMBER BELAJAR ---
const RESOURCE_DATABASE: Record<string, { title: string; url: string; type: "video" | "pdf" | "audio" | "web"; desc: string }[]> = {
  A1: [
    { title: "Nicos Weg A1 (Film)", url: "https://learngerman.dw.com/en/nicos-weg/c-36519789", type: "video", desc: "Film interaktif terbaik dari DW untuk pemula." },
    { title: "Kamus Lio (Indo-Jerman)", url: "https://dict.leo.org/indonesisch-deutsch/", type: "web", desc: "Kamus online paling akurat dengan contoh kalimat." },
    { title: "Slow German (Podcast)", url: "https://slowgerman.com/", type: "audio", desc: "Podcast dengan tempo lambat, topik sehari-hari." },
    { title: "PDF: Basic German Grammar", url: "https://www.nthuleen.com/teach/grammar.html", type: "pdf", desc: "Lembar kerja grammar gratis (Open Source)." },
    { title: "Easy German: Super Easy", url: "https://www.youtube.com/playlist?list=PL3936178A38BB5F87", type: "video", desc: "Wawancara jalanan yang sangat dasar." },
    { title: "Goethe A1 Wordlist (PDF)", url: "https://www.goethe.de/pro/relaunch/prf/en/Goethe-Zertifikat_A1_Wortliste.pdf", type: "pdf", desc: "Daftar kosakata resmi ujian A1 Goethe Institut." }
  ],
  A2: [
    { title: "Nicos Weg A2", url: "https://learngerman.dw.com/en/nicos-weg/c-36519789", type: "video", desc: "Lanjutan kisah Nico. Wajib tonton!" },
    { title: "Vokabeltrainer (App)", url: "https://trainer.vhs-lernportal.de/", type: "web", desc: "Portal latihan kosakata resmi VHS Jerman." },
    { title: "Deutsche Welle: Top-Thema", url: "https://learngerman.dw.com/de/top-thema/s-55550996", type: "audio", desc: "Berita ringan dengan audio lambat + teks." },
    { title: "Schubert Verlag Online", url: "https://www.schubert-verlag.de/aufgaben/", type: "web", desc: "Gudangnya latihan soal grammar online gratis." },
    { title: "PDF: A2 Übungen", url: "https://www.schubert-verlag.de/aufgaben/arbeitsblaetter_a2_z/a2_arbeitsblaetter_index.htm", type: "pdf", desc: "Download lembar kerja latihan A2." },
    { title: "Easy German Podcast", url: "https://www.easygerman.org/podcast", type: "audio", desc: "Obrolan natural tapi jelas." }
  ],
  B1: [
    { title: "Nicos Weg B1", url: "https://learngerman.dw.com/en/nicos-weg/c-36519789", type: "video", desc: "Penutup trilogi Nico. Level menengah." },
    { title: "Jojo sucht das Glück", url: "https://learngerman.dw.com/de/jojo-sucht-das-gl%C3%BCck/c-55266749", type: "video", desc: "Telenovela seru khusus belajar Jerman." },
    { title: "Nachrichtenleicht", url: "https://www.nachrichtenleicht.de/", type: "web", desc: "Berita Jerman asli tapi dengan bahasa sederhana." },
    { title: "B1 Modelltest PDF", url: "https://www.goethe.de/pro/relaunch/prf/en/Goethe-Zertifikat_B1_Modell_Erwachsene.pdf", type: "pdf", desc: "Contoh soal ujian asli B1." },
    { title: "Auf Deutsch gesagt", url: "https://aufdeutschgesagt.wordpress.com/", type: "audio", desc: "Podcast untuk melatih pendengaran tingkat lanjut." },
    { title: "Lingolia Grammar", url: "https://deutsch.lingolia.com/de/grammatik", type: "web", desc: "Penjelasan grammar super detail." }
  ],
  B2: [
    { title: "Tagesschau (Berita)", url: "https://www.tagesschau.de/", type: "video", desc: "Berita TV utama Jerman (15 menit setiap jam 20:00)." },
    { title: "Spiegel Online", url: "https://www.spiegel.de/", type: "web", desc: "Bacaan artikel jurnalistik tingkat tinggi." },
    { title: "MrWissen2go", url: "https://www.youtube.com/user/MrWissen2go", type: "video", desc: "Analisis sejarah dan politik Jerman (Cepat)." },
    { title: "Terra X (Doku)", url: "https://www.zdf.de/dokumentation/terra-x", type: "video", desc: "Dokumenter alam dan sejarah (Bahasa formal)." },
    { title: "Redewendungen PDF", url: "https://www.redensarten-index.de/", type: "web", desc: "Kamus idiom dan peribahasa Jerman." },
    { title: "Deutsch Perfekt Audio", url: "https://www.deutsch-perfekt.com/deutsch-hoeren", type: "audio", desc: "Latihan mendengar profesional." }
  ]
};

// --- AKTIVITAS MINGGU (CULTURAL) ---
const SUNDAY_ACTIVITIES = [
  { title: "Musik: Analisis Lirik Lagu", duration: "20 Min", type: "audio", desc: "Cari lagu dari Namika, Cro, atau Mark Forster. Baca liriknya." },
  { title: "Virtual Tour: Kota Berlin/Munich", duration: "30 Min", type: "video", desc: "Cari 'Walking Tour Berlin 4K' di YouTube. Rasakan suasananya." },
  { title: "Kuliner: Masak Resep Jerman", duration: "60 Min", type: "rest", desc: "Coba resep simpel: Bratkartoffeln atau Salad Kentang." },
  { title: "Film: Nonton Film/Serial Jerman", duration: "90 Min", type: "video", desc: "Rekomendasi: 'Dark' atau film anak-anak di Netflix (Audio Jerman)." },
  { title: "Peribahasa: Hafalkan 3 Idiom", duration: "15 Min", type: "web", desc: "Contoh: 'Ich verstehe nur Bahnhof' (Saya tidak mengerti sama sekali)." }
];

const MOTIVATIONAL_QUOTES = [
  { text: "Aller Anfang ist schwer.", translation: "Semua permulaan itu sulit." },
  { text: "Übung macht den Meister.", translation: "Latihan membuat sempurna." },
  { text: "Wer nicht wagt, der nicht gewinnt.", translation: "Siapa tidak berani, dia tidak menang." },
  { text: "Es ist noch kein Meister vom Himmel gefallen.", translation: "Tidak ada ahli yang jatuh dari langit." },
  { text: "Morgenstund hat Gold im Mund.", translation: "Pagi hari membawa emas." }
];

type DailyTask = {
  id: string;
  title: string;
  detail?: string;
  duration: string;
  type: "learn" | "practice" | "video" | "pdf" | "audio" | "web" | "rest" | "review";
  link?: string;
  linkDesc?: string;
};

type WeekPlan = {
  week: number;
  days: DailyTask[];
  focus: string;
};

const PlannerPage = () => {
  const { toast } = useToast();
  
  const [levels, setLevels] = useState<Level[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [generatedPlan, setGeneratedPlan] = useState<WeekPlan[] | null>(null);
  
  // ADJUST: Menyimpan object { status, link, notes } per task ID
  const [userProgress, setUserProgress] = useState<Record<string, { status: string; link: string; notes: string }>>({});
  
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
        setLoadingLevels(true);
        const data = await getLevelsFromDB();
        setLevels(data);
        setLoadingLevels(false);
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    const savedPlan = localStorage.getItem("deutsch_planner_data");
    const savedProgress = localStorage.getItem("deutsch_planner_user_progress"); 
    const savedLevel = localStorage.getItem("deutsch_planner_level");
    
    if (savedPlan) {
      setGeneratedPlan(JSON.parse(savedPlan));
      setIsSettingsOpen(false); 
    }
    if (savedProgress) setUserProgress(JSON.parse(savedProgress));
    if (savedLevel) setSelectedLevel(savedLevel);

    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem("deutsch_planner_user_progress", JSON.stringify(userProgress));
  }, [userProgress]);

  // ADJUST: Helper untuk update data (Status/Link/Note)
  const updateTaskData = (taskId: string, field: "status" | "link" | "notes", value: string) => {
    setUserProgress(prev => ({
        ...prev,
        [taskId]: {
            ...(prev[taskId] || { status: "not_started", link: "", notes: "" }),
            [field]: value
        }
    }));
  };

  const calculateProgress = () => {
    if (!generatedPlan) return 0;
    const totalTasks = generatedPlan.reduce((acc, week) => acc + week.days.length, 0);
    const finishedTasks = Object.values(userProgress).filter(p => p.status === "done").length;
    return totalTasks === 0 ? 0 : Math.round((finishedTasks / totalTasks) * 100);
  };

  const generatePlan = () => {
    const levelData = levels.find((l) => l.id === selectedLevel);
    
    if (!levelData) {
        toast({ variant: "destructive", title: "Data Belum Siap", description: "Tunggu sebentar, sedang memuat data..." });
        return;
    }

    const modules = levelData.subSections;
    const totalWeeks = durationMonths * 4; 
    const modulesPerWeek = modules.length / totalWeeks;
    
    const plan: WeekPlan[] = [];
    let currentModuleIndex = 0;
    const resources = RESOURCE_DATABASE[selectedLevel] || RESOURCE_DATABASE["A1"];

    for (let week = 1; week <= totalWeeks; week++) {
      const weekDays: DailyTask[] = [];
      const startModuleIndex = Math.floor(currentModuleIndex);
      let endModuleIndex = Math.floor(currentModuleIndex + modulesPerWeek);
      
      if (week === totalWeeks) {
          endModuleIndex = modules.length;
      }
      
      const currentModules = modules.slice(startModuleIndex, endModuleIndex);
      const focusTopics = currentModules.map(m => m.title).join(", ");
      const weeklyResource = resources[(week - 1) % resources.length];
      const sundayActivity = SUNDAY_ACTIVITIES[(week - 1) % SUNDAY_ACTIVITIES.length];
      const makeId = (day: number) => `${selectedLevel}-W${week}-D${day}`;

      if (currentModules.length > 0) {
        weekDays.push({ id: makeId(1), title: `Materi: ${currentModules[0].title}`, detail: "Pelajari kosakata & gender kata benda.", duration: "45 Min", type: "learn" });
      } else {
        weekDays.push({ id: makeId(1), title: "Review Mandiri", detail: "Ulangi catatan minggu lalu.", duration: "30 Min", type: "review" });
      }

      weekDays.push({ id: makeId(2), title: "Bedah Grammar", detail: "Buat 5 kalimat sendiri.", duration: "30 Min", type: "learn" });
      weekDays.push({ id: makeId(3), title: "Latihan Aktif", detail: "Flashcard & Quiz di web ini.", duration: "25 Min", type: "practice" });
      weekDays.push({ id: makeId(4), title: `Eksplorasi: ${weeklyResource.title}`, detail: "Simak dan catat kata baru.", duration: "30 Min", type: weeklyResource.type as any, link: weeklyResource.url, linkDesc: weeklyResource.desc });
      weekDays.push({ id: makeId(5), title: "Output (Jurnal/Audio)", detail: "Tulis/rekam keseharianmu.", duration: "20 Min", type: "practice" });
      weekDays.push({ id: makeId(6), title: "Evaluasi Mingguan", detail: `Review topik: ${focusTopics}`, duration: "30 Min", type: "review" });
      weekDays.push({ id: makeId(7), title: `Minggu Santai: ${sundayActivity.title}`, detail: sundayActivity.desc, duration: sundayActivity.duration, type: sundayActivity.type as any, linkDesc: "Mandiri" });

      plan.push({ week: week, days: weekDays, focus: focusTopics || "Review & Penguatan" });
      currentModuleIndex += modulesPerWeek;
    }

    setGeneratedPlan(plan);
    setUserProgress({});
    localStorage.setItem("deutsch_planner_data", JSON.stringify(plan));
    localStorage.setItem("deutsch_planner_level", selectedLevel);
    setIsSettingsOpen(false);
    toast({ title: "Plan Siap!", description: "Selamat belajar!" });
  };

  // --- STYLE HELPER BARU ---
  const getTaskStyle = (type: string) => {
    switch (type) {
      case "learn": return "bg-blue-100 text-blue-800 border-blue-200";
      case "practice": return "bg-green-100 text-green-800 border-green-200";
      case "video": return "bg-red-100 text-red-800 border-red-200";
      case "pdf": return "bg-orange-100 text-orange-800 border-orange-200";
      case "audio": return "bg-purple-100 text-purple-800 border-purple-200";
      case "web": return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "review": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "rest": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "learn": return <BookOpen className="w-4 h-4" />;
      case "practice": return <PenTool className="w-4 h-4" />;
      case "video": return <Youtube className="w-4 h-4" />;
      case "pdf": return <FileText className="w-4 h-4" />;
      case "audio": return <Headphones className="w-4 h-4" />;
      case "web": return <Globe className="w-4 h-4" />;
      case "review": return <Target className="w-4 h-4" />;
      case "rest": return <Coffee className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case "done": return "bg-green-100 text-green-700 border-green-200";
          case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
          default: return "bg-white border-slate-200 text-slate-500";
      }
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setGeneratedPlan(null);
    setUserProgress({});
    localStorage.removeItem("deutsch_planner_data");
    localStorage.removeItem("deutsch_planner_user_progress");
    setIsSettingsOpen(true);
    setShowResetConfirm(false);
    toast({ title: "Reset Berhasil 🗑️", description: "Silakan buat rencana baru.", duration: 2000 });
  };

  const getDurationText = (months: number) => {
    if (months <= 2) return "🔥 Mode Ngebut: Jadwal padat tiap hari. Cocok buat yang mau ujian cepat.";
    if (months <= 4) return "⚖️ Mode Normal: Santai tapi serius. Pas buat rutinitas harian.";
    return "🌱 Mode Santai: Belajar pelan-pelan asal kelakon. Cocok buat sampingan.";
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      
      {/* HERO & QUOTE */}
      <div className="bg-yellow-50 border-b-4 border-foreground py-10 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white border-2 border-foreground rounded-full mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            <Sparkles size={24} className="text-yellow-500 fill-yellow-500" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-tighter">Mein Weg</h1>
          <div className="max-w-xl mx-auto mt-2 p-4 bg-white border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transform -rotate-1 hover:rotate-0 transition-transform">
            <p className="text-lg font-bold text-foreground italic">"{quote.text}"</p>
            <p className="text-sm text-muted-foreground mt-1">— {quote.translation}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: SETTING (Sticky) */}
        <div className="md:col-span-4 lg:col-span-4 space-y-6">
          
          {/* Progress Card */}
          {generatedPlan && (
            <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white mb-6">
              <CardHeader className="border-b-2 border-foreground/10 pb-2 bg-blue-50">
                <CardTitle className="text-sm font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4" /> Statistik Kamu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-end justify-between mb-2">
                  <div className="text-5xl font-black text-blue-600">{calculateProgress()}%</div>
                  <div className="text-right text-sm font-bold text-muted-foreground">
                    Level {selectedLevel}<br/>{durationMonths} Bulan
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 border border-foreground overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setting Card */}
          <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:sticky md:top-24 h-fit">
            <CardHeader 
              className="bg-yellow-100 border-b-4 border-foreground p-4 cursor-pointer md:cursor-default hover:bg-yellow-200/50 md:hover:bg-yellow-100 transition-colors"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <CardTitle className="text-xl font-black flex items-center justify-between">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Pengaturan</span>
                <span className="md:hidden">{isSettingsOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}</span>
              </CardTitle>
            </CardHeader>
            
            <div className={cn("transition-all duration-300 overflow-hidden", isSettingsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 md:max-h-none md:opacity-100")}>
              <CardContent className="p-6 space-y-6">
                {!generatedPlan ? (
                  <>
                    <div className="space-y-3">
                      <label className="font-bold flex gap-2"><GraduationCap className="w-4 h-4"/> Target Level</label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="border-2 border-foreground font-bold shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-2 border-foreground font-bold">
                          {["A1","A2","B1","B2"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="font-bold flex gap-2"><Clock className="w-4 h-4"/> Durasi</label>
                      <div className="flex items-center gap-4">
                        <Slider defaultValue={[1]} max={6} min={1} step={1} onValueChange={(v) => setDurationMonths(v[0])} />
                        <span className="font-black text-xl w-8">{durationMonths} Bln</span>
                      </div>
                      <div className="p-3 bg-muted/20 border-2 border-dashed border-foreground/30 rounded-lg text-sm font-medium text-muted-foreground italic">
                        {getDurationText(durationMonths)}
                      </div>
                    </div>
                    <Button 
                        onClick={generatePlan} 
                        disabled={loadingLevels}
                        size="lg" 
                        className="w-full font-black border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none bg-green-500 hover:bg-green-600 text-white"
                    >
                        {loadingLevels ? "MEMUAT DATA..." : "GENERATE RENCANA"}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/20 p-4 rounded border-2 border-dashed border-foreground/30 text-center">
                      <p className="text-sm text-muted-foreground">Target Aktif:</p>
                      <p className="text-xl font-black text-foreground">Level {selectedLevel}</p>
                    </div>
                    <Button onClick={handleResetClick} variant="destructive" className="w-full border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
                      <RefreshCcw className="w-4 h-4 mr-2"/> Reset / Ganti Level
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* KOLOM KANAN: JADWAL DETAIL */}
        <div className="md:col-span-8 lg:col-span-8">
          {!generatedPlan ? (
            <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-foreground/20 rounded-xl min-h-[400px] text-center bg-white/50">
              <div className="bg-white p-4 rounded-full border-2 border-foreground/20 mb-4">
                <Target className="w-16 h-16 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-bold text-muted-foreground">Belum Ada Jadwal</h3>
              <p className="text-muted-foreground">Atur target di panel pengaturan untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {generatedPlan.map((weekItem, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`week-${weekItem.week}`} 
                    className="border-2 border-foreground rounded-lg bg-white overflow-hidden shadow-sm data-[state=open]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-accent/30 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full text-left">
                        <span className="bg-foreground text-background px-3 py-1 font-black rounded text-sm uppercase shrink-0 w-fit">Minggu {weekItem.week}</span>
                        <span className="font-bold text-lg leading-tight">{weekItem.focus}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 border-t-2 border-foreground/10 bg-slate-50/50">
                      <div className="divide-y divide-dashed divide-foreground/20">
                        {weekItem.days.map((task, dayIdx) => {
                          const currentProgress = userProgress[task.id] || { status: "not_started", link: "", notes: "" };
                          return (
                            <div key={task.id} className={cn("flex flex-col sm:flex-row gap-4 p-5 transition-colors", currentProgress.status === "done" ? "bg-green-50" : "")}>
                              
                              {/* ADJUST: Ganti Checkbox dengan Dropdown Status */}
                              <div className="shrink-0 pt-1 flex sm:flex-col items-start gap-2 sm:w-32">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Hari {dayIdx+1}</span>
                                <Select 
                                    value={currentProgress.status} 
                                    onValueChange={(val: any) => updateTaskData(task.id, "status", val)}
                                >
                                    <SelectTrigger className={cn("h-8 text-xs font-bold border-2 transition-colors w-full", getStatusColor(currentProgress.status))}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_started"><div className="flex items-center"><Circle className="w-3 h-3 mr-2"/> Belum</div></SelectItem>
                                        <SelectItem value="in_progress"><div className="flex items-center"><Clock className="w-3 h-3 mr-2"/> Proses</div></SelectItem>
                                        <SelectItem value="done"><div className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2"/> Selesai</div></SelectItem>
                                    </SelectContent>
                                </Select>
                              </div>

                              {/* Detail Tugas */}
                              <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                  <label className={cn("font-bold text-lg block", currentProgress.status === "done" && "line-through text-muted-foreground")}>
                                    {task.title}
                                  </label>
                                  
                                  {/* Chips Info */}
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded border border-black/10 flex items-center gap-1 uppercase tracking-wide", getTaskStyle(task.type))}>
                                      {getTaskIcon(task.type)} {task.type}
                                    </span>
                                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-black/10">
                                      <Clock className="w-3 h-3"/> {task.duration}
                                    </span>
                                  </div>

                                  {/* Detail Materi */}
                                  {task.detail && (
                                    <p className="text-sm text-slate-600 mt-2 p-2 bg-white rounded border border-slate-200 flex gap-2">
                                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                      {task.detail}
                                    </p>
                                  )}

                                  {/* External Link Asli */}
                                  {task.link && (
                                    <a href={task.link} target="_blank" className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded border border-blue-200 transition-transform hover:scale-105">
                                      <ExternalLink className="w-3 h-3"/> Buka Materi: {task.linkDesc}
                                    </a>
                                  )}
                                </div>

                                {/* ADJUST: AREA INPUT TAMBAHAN (Spreadsheet-like) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-dashed border-slate-200">
                                    <Input 
                                        placeholder="Paste link sumber tambahan..." 
                                        className="h-8 text-xs bg-white border-slate-200 focus:border-black"
                                        value={currentProgress.link}
                                        onChange={(e) => updateTaskData(task.id, "link", e.target.value)}
                                    />
                                    <Textarea 
                                        placeholder="Catatan pribadi..." 
                                        className="min-h-[32px] h-8 text-xs py-1.5 resize-none bg-white border-slate-200 focus:border-black transition-all focus:min-h-[60px]"
                                        value={currentProgress.notes}
                                        onChange={(e) => updateTaskData(task.id, "notes", e.target.value)}
                                    />
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>

      {/* --- POP-UP CONFIRMATION RESET --- */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-red-50 border-b-4 border-foreground pb-4 text-center">
              <div className="mx-auto p-3 bg-red-100 rounded-full border-2 border-red-500 text-red-600 w-fit mb-2 animate-bounce">
                <AlertTriangle size={32} />
              </div>
              <CardTitle className="text-2xl font-black text-red-600 uppercase">Hapus Rencana?</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-2">
              <p className="font-bold text-lg text-foreground">Yakin mau mulai dari awal?</p>
              <p className="text-muted-foreground text-sm">
                Semua progress centang dan jadwal yang sudah dibuat akan <strong>dihapus permanen</strong>.
              </p>
            </CardContent>
            <div className="p-6 pt-0 flex gap-3">
              <Button 
                onClick={() => setShowResetConfirm(false)} 
                variant="outline" 
                className="flex-1 border-2 border-foreground font-bold h-12 hover:bg-slate-100"
              >
                Batal
              </Button>
              <Button 
                onClick={confirmReset} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 font-black h-12"
              >
                YA, HAPUS
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;