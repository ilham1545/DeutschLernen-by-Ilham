import { useState } from "react";
import { programs } from "@/data/programs"; 
import { useProgramProgress } from "@/hooks/useProgramProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, Briefcase, GraduationCap, HeartHandshake, Plane, 
  ChevronRight, Info, Banknote, Clock, BookOpen, Languages, Leaf, ExternalLink, Globe
} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper grouping jurusan berdasarkan kategori
const categories = {
  health: "Kesehatan & Sosial (Gesundheit)",
  tech: "Teknik & Industri (Technik)",
  business: "Bisnis & Admin (Kaufmännisch)",
  gastro: "Hospitality & Service",
  craft: "Kerajinan & Konstruksi (Handwerk)",
  logistics: "Logistik & Transport",
  science: "Sains & Laboratorium",
  social: "Sosial & Lingkungan"
};

const MeinWegPage = () => {
  const [mainCategory, setMainCategory] = useState<string>("aupair");
  // Default jurusan saat masuk Ausbildung
  const [selectedMajor, setSelectedMajor] = useState<string>("aus_general");
  // Filter Kategori Jurusan
  const [filterCat, setFilterCat] = useState<string>("all");

  const { toggleItem, isChecked, getProgress } = useProgramProgress();
  const { logActivity } = useActivityLog();

  // Logika Program Aktif
  // Jika mainCategory adalah 'aus_general' (Menu Ausbildung), maka tampilkan program sesuai selectedMajor
  // Jika tidak (misal Au Pair), tampilkan program sesuai mainCategory
  const activeProgramId = mainCategory === "aus_general" || mainCategory.startsWith("aus_") ? selectedMajor : mainCategory;
  
  // Fallback safe guard jika ID tidak ditemukan
  const currentProgram = programs[activeProgramId] || programs["aus_general"];

  // Hitung Progress
  const reqIds = currentProgram?.requirements?.map(r => r.id) || [];
  const progressPercent = getProgress(reqIds);

  // Ambil list jurusan Ausbildung untuk dropdown, difilter by category
  const ausbildungOptions = Object.values(programs).filter(p => {
    // Ambil yang punya ID 'aus_' dan bukan general
    const isAusbildung = p.id.startsWith("aus_") && p.id !== "aus_general";
    // Filter kategori
    const matchCategory = filterCat === "all" || p.category === filterCat;
    return isAusbildung && matchCategory;
  });

  // Helper Icon Sidebar
  const getIcon = (id: string) => {
    if (id === "aupair") return <HeartHandshake className="w-5 h-5 text-pink-500" />;
    if (id === "fsj") return <HeartHandshake className="w-5 h-5 text-green-600" />;
    if (id === "foj") return <Leaf className="w-5 h-5 text-emerald-500" />;
    if (id === "studium") return <GraduationCap className="w-5 h-5 text-purple-600" />;
    if (id === "studienkolleg") return <BookOpen className="w-5 h-5 text-indigo-500" />;
    if (id === "sprachschule") return <Languages className="w-5 h-5 text-orange-500" />;
    return <Briefcase className="w-5 h-5 text-blue-600" />;
  };

  const handleCheck = (id: string, label: string) => {
    const isNowChecked = !isChecked(id);
    toggleItem(id);
    if (isNowChecked) {
        logActivity("doc", `Melengkapi dokumen (${currentProgram.title}): ${label}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white py-12 border-b-4 border-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4 flex items-center justify-center gap-3">
            <Plane className="w-10 h-10 text-yellow-400" /> Mein Weg
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Database lengkap program karir ke Jerman. Pilih jalurmu, cek gajinya, dan lengkapi syaratnya.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
            {/* SIDEBAR MENU */}
            <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Jalur Program</p>
            
            {[
                { id: "aupair", label: "Au Pair" },
                { id: "fsj", label: "FSJ / BFD (Sosial)" },
                { id: "foj", label: "FÖJ (Lingkungan)" },
                { id: "aus_general", label: "Ausbildung (Kerja)" },
                { id: "studium", label: "Studium (Kuliah)" },
                { id: "studienkolleg", label: "Studienkolleg" },
                { id: "sprachschule", label: "Kursus Bahasa" }
            ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                    setMainCategory(menu.id);
                    // Reset pilihan jurusan ke general jika pindah ke menu ausbildung
                    if (menu.id === "aus_general") setSelectedMajor("aus_general");
                }}
                className={cn(
                  "w-full text-left px-4 py-4 rounded-xl font-bold flex items-center justify-between transition-all border-2",
                  mainCategory === menu.id || (menu.id === "aus_general" && mainCategory.startsWith("aus_"))
                    ? "bg-white border-blue-600 text-blue-600 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] translate-x-1" 
                    : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                    {getIcon(menu.id)}
                    <span>{menu.label}</span>
                </div>
                {(mainCategory === menu.id || (menu.id === "aus_general" && mainCategory.startsWith("aus_"))) && <ChevronRight className="w-5 h-5"/>}
              </button>
            ))}

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100 text-sm text-blue-800">
                <p className="font-bold flex items-center gap-2 mb-1"><Info className="w-4 h-4"/> Data Terkini</p>
                <p>Informasi gaji dan syarat diambil dari data resmi pemerintah Jerman (Bundesagentur) tahun 2024/2025.</p>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* --- FILTER & SELECTOR KHUSUS AUSBILDUNG --- */}
              {(mainCategory === "aus_general" || mainCategory.startsWith("aus_")) && (
                  <Card className="border-4 border-foreground bg-slate-100">
                      <CardContent className="p-4 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="w-5 h-5 text-blue-600"/>
                              <h3 className="font-black text-lg text-slate-800">Cari Jurusan Ausbildung</h3>
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-4">
                              {/* 1. Filter Kategori */}
                              <div className="w-full md:w-1/3">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Kategori</label>
                                  <Select value={filterCat} onValueChange={setFilterCat}>
                                    <SelectTrigger className="font-bold bg-white border-2 border-slate-300">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="font-bold">Semua Bidang</SelectItem>
                                        <SelectItem value="health" className="font-bold">Kesehatan (Medis)</SelectItem>
                                        <SelectItem value="tech" className="font-bold">Teknik & IT</SelectItem>
                                        <SelectItem value="business" className="font-bold">Bisnis & Kantor</SelectItem>
                                        <SelectItem value="gastro" className="font-bold">Hotel & Restoran</SelectItem>
                                        <SelectItem value="craft" className="font-bold">Konstruksi & Teknik Sipil</SelectItem>
                                        <SelectItem value="logistics" className="font-bold">Logistik & Transport</SelectItem>
                                        <SelectItem value="science" className="font-bold">Sains & Lab</SelectItem>
                                    </SelectContent>
                                  </Select>
                              </div>

                              {/* 2. Pilih Jurusan */}
                              <div className="w-full md:w-2/3">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nama Jurusan</label>
                                  <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                                    <SelectTrigger className="font-bold bg-white border-2 border-slate-300">
                                        <SelectValue placeholder="Pilih Jurusan..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <SelectItem value="aus_general" className="font-black text-blue-600">-- Info Umum Ausbildung --</SelectItem>
                                        {ausbildungOptions.map((prog) => (
                                            <SelectItem key={prog.id} value={prog.id} className="font-medium">
                                                {prog.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              )}

              {/* --- INFO CARD DETAIL --- */}
              <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-100 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-3 inline-block",
                          currentProgram.category === "health" ? "bg-red-100 text-red-700 border-red-200" :
                          currentProgram.category === "tech" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          currentProgram.category === "business" ? "bg-purple-100 text-purple-700 border-purple-200" :
                          currentProgram.category === "social" ? "bg-green-100 text-green-700 border-green-200" :
                          "bg-slate-200 text-slate-700 border-slate-300"
                      )}>
                          {currentProgram.category ? categories[currentProgram.category as keyof typeof categories] : "Program Umum"}
                      </span>
                      
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">{currentProgram.title}</h2>
                      
                      {/* Badge Gaji & Durasi */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                            <Banknote className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold text-green-800">{currentProgram.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-800">{currentProgram.duration}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed text-base md:text-lg">{currentProgram.description}</p>
                      {currentProgram.source && (
                          <p className="text-[10px] text-slate-400 mt-2 italic">Sumber: {currentProgram.source}</p>
                      )}
                    </div>

                    {/* Radial Progress Widget (Hanya tampil jika ada requirements) */}
                    {currentProgram.requirements && currentProgram.requirements.length > 0 && (
                        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-4 border-slate-100 shadow-sm min-w-[120px]">
                            <div className={cn("text-4xl font-black", 
                                progressPercent === 100 ? "text-green-600" : "text-blue-600"
                            )}>
                                {progressPercent}%
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Kesiapan</div>
                        </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 bg-white">
                  <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-yellow-500"/> Apa yang akan dipelajari?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentProgram.whatYouLearn.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 transition-colors">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* --- CHECKLIST DOKUMEN (TAMPIL JIKA ADA DATA) --- */}
              {currentProgram.requirements && currentProgram.requirements.length > 0 && (
                  <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                    <CardHeader className="bg-yellow-400 border-b-4 border-foreground py-4 flex flex-row items-center justify-between">
                      <CardTitle className="text-xl font-black flex items-center gap-2 text-black">
                        <CheckCircle2 className="w-6 h-6"/> Checklist Dokumen
                      </CardTitle>
                      <span className="text-xs font-black bg-white px-3 py-1 rounded-full border-2 border-black shadow-sm">
                        {currentProgram.requirements.length} Item
                      </span>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Progress Bar Mobile */}
                      <div className="md:hidden p-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span>Kelengkapan Dokumen</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="h-4 bg-white rounded-full overflow-hidden border-2 border-slate-200">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                            {currentProgram.requirements.map((req) => {
                            const active = isChecked(req.id);
                            return (
                                <div 
                                key={req.id} 
                                onClick={() => handleCheck(req.id, req.label)}
                                className={cn(
                                    "p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-yellow-50/50 group",
                                    active ? "bg-green-50" : ""
                                )}
                                >
                                <button className={cn(
                                    "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                    active 
                                    ? "bg-green-500 border-green-500 text-white scale-110 shadow-sm" 
                                    : "border-slate-300 text-transparent group-hover:border-blue-400 bg-white"
                                )}>
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                                
                                <div className="flex-1">
                                    <p className={cn(
                                    "font-bold text-lg transition-all select-none",
                                    active ? "text-slate-500 line-through decoration-2 decoration-slate-300" : "text-slate-800"
                                    )}>
                                    {req.label}
                                    </p>
                                    {req.note && (
                                        <p className={cn("text-xs font-bold mt-1 flex items-center gap-1", active ? "text-slate-400" : "text-blue-600")}>
                                            <Info className="w-3 h-3"/> {req.note}
                                        </p>
                                    )}
                                </div>
                                </div>
                            );
                            })}
                      </div>
                    </CardContent>
                  </Card>
              )}
              
              {/* --- WEBSITE LINK (TAMPIL JIKA ADA DATA) --- */}
              {currentProgram.usefulLinks && currentProgram.usefulLinks.length > 0 && (
                  <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                    <CardHeader className="bg-blue-600 text-white border-b-4 border-foreground py-6">
                      <CardTitle className="text-xl font-black flex items-center gap-2">
                        <Globe className="w-6 h-6"/> Website Resmi & Lowongan
                      </CardTitle>
                      <p className="text-blue-100 text-sm mt-1">Gunakan link di bawah untuk mencari info valid atau melamar langsung.</p>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-100">
                        {currentProgram.usefulLinks.map((link, idx) => (
                            <a 
                                key={idx} 
                                href={link.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="block p-5 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-black text-lg text-blue-700 group-hover:underline decoration-2 underline-offset-2">
                                            {link.label}
                                        </h4>
                                        <p className="text-slate-600 text-sm mt-1 font-medium">{link.description}</p>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors"/>
                                </div>
                            </a>
                        ))}
                    </CardContent>
                  </Card>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MeinWegPage;