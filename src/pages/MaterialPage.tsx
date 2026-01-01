import { useState, useEffect } from "react"; 
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Lightbulb, ExternalLink, FileText, Youtube, Headphones, Globe, PlayCircle, AlertTriangle, X, Loader2 } from "lucide-react"; 
import { cn } from "@/lib/utils";
import AudioButton from "@/components/AudioButton";

// Import Fetcher Database
import { getCourseMaterialsFromDB, CourseMaterial, ContentBlock } from "@/data/course_materials";
import { examMaterials } from "@/data/exam_materials"; 

const MaterialPage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  
  // State untuk data dari Database
  const [material, setMaterial] = useState<CourseMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  // Cek apakah ini Ujian
  const isExamMaterial = levelId?.startsWith("EXAM");

  // --- FETCH DATA (useEffect) ---
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        if (levelId) {
            if (isExamMaterial) {
                // Kalo Ujian, ambil dari file lokal (sementara)
                const exam = examMaterials.find(e => e.id === levelId);
                // Kita casting tipe biar cocok (asumsi struktur sama)
                if (exam) setMaterial(exam as unknown as CourseMaterial); 
            } else {
                // Kalo Materi Belajar, AMBIL DARI DATABASE SUPABASE!
                const data = await getCourseMaterialsFromDB(levelId);
                setMaterial(data);
            }
        }
        setLoading(false);
    };
    fetchData();
  }, [levelId, isExamMaterial]);


  // --- LOGIKA TOMBOL START ---
  const handleStartClick = () => {
    if (isExamMaterial) {
      setShowConfirm(true);
    } else {
      navigate(`/level/${levelId}`);
    }
  };

  const confirmStartExam = () => {
    setShowConfirm(false);
    navigate(`/simulation/${levelId}`);
  };

  // --- FUNGSI FORMAT TEXT ---
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index} className="font-black text-foreground bg-yellow-200/50 px-1 rounded-sm">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return <em key={index} className="italic font-semibold text-foreground/90">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Fungsi Render Blok Konten (Updated: Support Image & Table & Text)
  const renderContent = (block: ContentBlock, idx: number) => {
    
    // 1. Render TEKS
    if (block.type === "text") {
      return (
        <div key={idx} className="text-lg leading-relaxed mb-6 whitespace-pre-wrap font-medium text-foreground/80">
          {formatText(block.content)}
        </div>
      );
    } 
    
    // 2. Render GAMBAR (Fixed TypeScript Error)
    if (block.type === "image") {
        // TypeScript sekarang tau kalau type="image", maka properti src & alt PASTI ADA (berkat Langkah 1)
        return (
          <div key={idx} className="my-8 flex flex-col items-center">
            <div className="relative w-full max-w-3xl rounded-xl overflow-hidden border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
              <img 
                src={block.src} 
                alt={block.alt || "Ilustrasi Materi"} 
                className="w-full h-auto object-contain max-h-[500px]"
                loading="lazy"
                onError={(e) => (e.currentTarget.style.display = 'none')} 
              />
            </div>
            {block.alt && (
              <p className="mt-3 text-sm font-bold text-muted-foreground italic text-center bg-yellow-50 px-4 py-1 rounded-full border border-yellow-200">
                📸 {block.alt}
              </p>
            )}
          </div>
        );
    }

    // 3. Render TABEL
    if (block.type === "table") {
      return (
        <div key={idx} className="overflow-x-auto mb-8 border-4 border-foreground rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left border-collapse min-w-[300px]">
            <thead>
              <tr className="bg-foreground text-background">
                {block.headers.map((head, hIdx) => (
                  <th key={hIdx} className="p-3 md:p-4 border-b-2 border-foreground font-black uppercase tracking-wider text-sm md:text-base">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className={cn("border-b border-foreground/20", rIdx % 2 === 0 ? "bg-white" : "bg-muted/30")}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 md:p-4 font-bold border-r border-foreground/10 last:border-r-0 text-sm md:text-base relative group whitespace-pre-wrap">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex-1">{formatText(cell)}</span>
                        {cell.length > 2 && (
                          <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <AudioButton text={cell} />
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    return null; // Fallback jika tipe tidak dikenali
  };

  // --- TAMPILAN LOADING ---
  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-foreground mb-4" />
              <p className="font-bold text-slate-500">Sebentar yaww!! Lagi nyiapin materinya nih...</p>
          </div>
      );
  }

  // --- TAMPILAN ERROR / KOSONG ---
  if (!material) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-black mb-4">Materi Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6">Mungkin belum ada data untuk level {levelId} di database.</p>
        <Link to="/"><Button size="lg" className="border-2 border-foreground">Kembali ke Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Header */}
      <div className={cn("py-12 border-b-4 border-foreground", isExamMaterial ? "bg-red-50" : "bg-yellow-50")}>
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">{material.title}</h1>
          <p className="text-xl max-w-2xl font-medium text-foreground/80">{material.description}</p>
        </div>
      </div>

      {/* Konten */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 max-w-4xl mx-auto">
          {material.sections.map((section, index) => (
            <Card key={section.id} className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <CardHeader className={cn("border-b-4 border-foreground py-6", isExamMaterial ? "bg-red-100" : "bg-blue-100")}>
                <CardTitle className="text-2xl md:text-3xl font-black flex items-center gap-4">
                  <span className="bg-foreground text-background w-10 h-10 flex items-center justify-center rounded-md text-lg shadow-sm shrink-0">{index + 1}</span>
                  {section.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8 bg-white">
                {section.content.map((block, idx) => renderContent(block, idx))}
                
                {section.tips && section.tips.length > 0 && (
                  <div className="mt-8 bg-yellow-50 border-l-8 border-yellow-400 p-6 rounded-r-lg">
                    <h4 className="font-black text-lg flex items-center gap-2 text-yellow-800 mb-3 uppercase tracking-wide">
                      <Lightbulb className="fill-yellow-400 text-yellow-800" /> Tips Penting:
                    </h4>
                    <ul className="space-y-2">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 font-bold text-foreground/80">
                          <span className="text-yellow-600 mt-1">•</span><span>{formatText(tip)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.resources && section.resources.length > 0 && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-foreground/20">
                    <h4 className="font-black text-base md:text-lg mb-4 flex items-center gap-2 uppercase tracking-wide text-foreground/80">
                      <BookOpen className="w-5 h-5" /> Sumber Belajar Tambahan:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {section.resources.map((res, i) => (
                        <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-md border-2 border-foreground bg-background hover:bg-accent hover:translate-x-1 transition-all group cursor-pointer">
                          <div className="p-2 bg-foreground text-background rounded-sm group-hover:bg-background group-hover:text-foreground transition-colors border border-foreground shrink-0">
                            {res.type === 'video' && <Youtube size={18} />}
                            {res.type === 'pdf' && <FileText size={18} />}
                            {res.type === 'audio' && <Headphones size={18} />}
                            {res.type === 'web' && <Globe size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate group-hover:underline decoration-2 underline-offset-2">{res.title}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{res.type}</p>
                          </div>
                          <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- TOMBOL AKSI DI BAWAH --- */}
        <div className="mt-16 text-center px-4 pb-12">
          <Button 
            onClick={handleStartClick} 
            size="lg" 
            className={cn(
              "w-full sm:w-auto h-auto py-4 sm:py-6 text-lg sm:text-xl px-6 sm:px-10 border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all text-white font-black uppercase tracking-wide whitespace-normal break-words leading-tight",
              isExamMaterial ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            )}
          >
            <div className="flex items-center justify-center gap-3">
              {isExamMaterial ? <PlayCircle className="w-6 h-6 shrink-0" /> : <BookOpen className="w-6 h-6 shrink-0" />}
              <span>
                {isExamMaterial ? "Mulai Simulasi Ujian Real-Time" : `Lanjut ke Kosakata ${levelId}`}
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* --- MODAL KONFIRMASI UJIAN (POPUP) --- */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-red-50 border-b-4 border-foreground pb-4 relative">
              <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 p-1 hover:bg-red-200 rounded transition-colors">
                <X size={24} />
              </button>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-red-100 rounded-full border-2 border-red-500 text-red-600">
                  <AlertTriangle size={32} />
                </div>
                <CardTitle className="text-2xl font-black text-red-600 uppercase tracking-tighter">
                  Siap Memulai Ujian?
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-lg font-medium text-foreground/80">
                Anda akan masuk ke mode simulasi.
              </p>
              <div className="bg-muted/30 p-4 rounded-lg border-2 border-dashed border-foreground/20 text-left space-y-2 text-sm font-bold text-muted-foreground">
                <p>⏱️ Waktu: 60 Menit (Otomatis Selesai)</p>
                <p>🔊 Audio: Tersedia di soal Hören</p>
                <p>🚫 Pause: Tidak bisa di-pause</p>
              </div>
            </CardContent>
            <div className="p-6 pt-0 flex gap-3">
              <Button 
                onClick={() => setShowConfirm(false)} 
                variant="outline" 
                className="flex-1 border-2 border-foreground font-bold h-12 text-lg"
              >
                Batal
              </Button>
              <Button 
                onClick={confirmStartExam} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 font-black h-12 text-lg uppercase tracking-wide"
              >
                Gas, Mulai! 🚀
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default MaterialPage;