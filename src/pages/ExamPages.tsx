import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"; // Tambah useParams
import { exams } from "@/data/exam"; // Import object 'exams' yang baru
import AudioButton from "@/components/AudioButton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Timer, ArrowRight, ArrowLeft, CheckCircle2, XCircle, RefreshCcw, LogOut, AlertTriangle, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; 

const ExamSimulationPage = () => {
  const { examId } = useParams(); // 1. Ambil ID dari URL (A1/A2/B1)
  const navigate = useNavigate();
  
  // 2. Cari soal berdasarkan ID. Default undefined kalau gak ada.
  const currentExamQuestions = exams[examId as string];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // --- EFEK RESET KETIKA UJIAN BERUBAH ---
  // Ini PENTING biar kalau pindah dari A1 ke B1, jawabannya ke-reset
  useEffect(() => {
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(60 * 60);
    setIsFinished(false);
    setScore(0);
  }, [examId]);

  // --- HANDLE JIKA UJIAN TIDAK DITEMUKAN ---
  if (!currentExamQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <FileWarning className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-2">Ujian Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">Simulasi ujian untuk level <span className="font-bold text-red-500">{examId}</span> belum tersedia.</p>
          <Link to="/">
            <Button size="lg" className="font-bold border-2 border-foreground">Kembali ke Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const question = currentExamQuestions[currentIdx];
  const totalQuestions = currentExamQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (val: string) => {
    setAnswers({ ...answers, [question.id]: val });
  };

  const nextQuestion = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      checkAndFinish();
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleExitClick = () => setShowExitConfirm(true);
  const confirmExit = () => navigate("/");

  const checkAndFinish = () => {
    const answeredIds = Object.keys(answers).map(Number);
    // Cek apakah jumlah jawaban sama dengan total soal
    // Note: Kita pakai filter boolean biar id yg undefined gak masuk
    if (answeredIds.length < totalQuestions) {
      const missingCount = totalQuestions - answeredIds.length;
      toast.error(`Masih ada ${missingCount} soal kosong!`, {
        description: "Isi semua soal sebelum selesai. Klik nomor putih di atas.",
        duration: 3000,
      });
      return; 
    }
    finishExam();
  };

  const finishExam = (force = false) => {
    let calculatedScore = 0;
    currentExamQuestions.forEach((q) => {
      const ans = answers[q.id] || "";
      if (q.type === "multiple-choice" || q.type === "true-false" || q.type === "text-input") {
        if (ans.toLowerCase() === q.correctAnswer?.toLowerCase()) {
          calculatedScore += 1;
        }
      } else if (q.type === "essay" || q.type === "speaking") {
         if (ans.length > 5) calculatedScore += 1; 
      }
    });
    setScore(Math.round((calculatedScore / totalQuestions) * 100));
    setIsFinished(true);
  };

  const resetExam = () => {
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(60 * 60);
    setIsFinished(false);
    setScore(0);
  };

  // --- RENDER HALAMAN HASIL ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="text-center bg-white border-b-4 border-foreground py-8">
            <CardTitle className="text-4xl font-black mb-2">HASIL UJIAN</CardTitle>
            <p className="text-muted-foreground font-medium">Goethe-Zertifikat {examId} (Simulasi)</p>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className={cn("w-40 h-40 rounded-full border-8 flex items-center justify-center text-5xl font-black shadow-inner", 
                score >= 60 ? "border-green-500 text-green-600 bg-green-50" : "border-red-500 text-red-600 bg-red-50"
              )}>
                {score}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className={cn("text-2xl font-black uppercase", score >= 60 ? "text-green-600" : "text-red-600")}>
                {score >= 60 ? "LULUS / BESTANDEN! 🎉" : "GAGAL 😢"}
              </h3>
              <p className="text-foreground/80 font-medium">
                {score >= 60 ? "Kamu siap ujian!" : "Jangan menyerah, coba lagi."}
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full border-2 border-foreground font-bold h-12">Home</Button>
              </Link>
              <Button onClick={resetExam} className="flex-1 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold h-12 bg-yellow-400 hover:bg-yellow-500 text-foreground">
                <RefreshCcw className="mr-2 h-4 w-4" /> Ulangi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER HALAMAN UJIAN ---
  return (
    <div className="min-h-screen bg-background flex flex-col pb-6 relative">
      
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-50 bg-foreground text-background py-3 px-4">
        <div className="container mx-auto flex justify-between items-center max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button onClick={handleExitClick} variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white px-2 h-9 border border-transparent hover:border-white/50">
              <LogOut className="w-5 h-5 sm:mr-2" />
              <span className="font-bold hidden sm:inline">Keluar</span>
            </Button>
            <div className="h-6 w-[1px] bg-white/30 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-lg tracking-wider whitespace-nowrap">EXAM {examId}</span>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-yellow-400 text-black rounded uppercase shrink-0">{question.section}</span>
            </div>
          </div>
          <div className={cn("flex items-center gap-2 font-mono text-sm sm:text-xl font-bold", timeLeft < 300 ? "text-red-400 animate-pulse" : "text-white")}>
            <Timer className="w-4 h-4 sm:w-5 sm:h-5" /> 
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* NAVIGATOR SOAL */}
      <div className="bg-slate-100 border-b-2 border-foreground/10 py-4 overflow-x-auto">
        <div className="container max-w-3xl px-4">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {currentExamQuestions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm font-bold rounded-md border-2 transition-all flex items-center justify-center",
                    isCurrent ? "border-blue-600 bg-blue-100 text-blue-700 ring-2 ring-blue-300 scale-110 z-10" 
                      : isAnswered ? "border-green-600 bg-green-500 text-white" 
                      : "border-gray-300 bg-white text-gray-400 hover:border-gray-400" 
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Progress value={progressPercentage} className="h-1 rounded-none bg-blue-100" />

      {/* MAIN CONTENT CARD */}
      <div className="flex-1 container mx-auto p-4 max-w-3xl flex flex-col justify-center mt-2">
        <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden flex flex-col min-h-[400px]">
          <CardHeader className="bg-slate-50 border-b-4 border-foreground pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase mb-1">
                  Soal {currentIdx + 1} / {totalQuestions} • {question.part}
                </p>
                <CardTitle className="text-lg md:text-xl font-black leading-tight">
                  {question.instruction}
                </CardTitle>
              </div>
              {question.audioText && (
                <div className="shrink-0 ml-2">
                   <div className="flex flex-col items-center gap-1">
                    <AudioButton text={question.audioText} className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 text-white hover:bg-blue-600 border-2 border-black" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Putar</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 md:p-8 space-y-6 flex-1">
            {question.context && (
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 text-base md:text-lg font-medium text-foreground/80 whitespace-pre-wrap italic shadow-sm">
                "{question.context}"
              </div>
            )}

            <h3 className="text-lg md:text-2xl font-black">{question.question}</h3>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {(question.type === "multiple-choice" || question.type === "true-false") && (
                <RadioGroup value={answers[question.id] || ""} onValueChange={handleAnswer} className="space-y-3">
                  {question.options?.map((opt, idx) => (
                    <div key={idx} className={cn(
                      "flex items-center space-x-3 p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-slate-50 active:scale-[0.99]",
                      answers[question.id] === opt ? "border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600" : "border-muted-foreground/20"
                    )}>
                      <RadioGroupItem value={opt} id={`opt-${idx}`} className="border-2 border-foreground text-blue-600 w-5 h-5" />
                      <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-base md:text-lg font-medium">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "text-input" && (
                <div className="space-y-2">
                  <Input 
                    value={answers[question.id] || ""} 
                    onChange={(e) => handleAnswer(e.target.value)} 
                    placeholder="Ketik jawaban singkat..." 
                    className="text-lg p-6 border-2 border-foreground font-bold focus-visible:ring-blue-500" 
                    autoComplete="off" 
                  />
                </div>
              )}

              {(question.type === "essay" || question.type === "speaking") && (
                <div className="space-y-4">
                  <Textarea 
                    value={answers[question.id] || ""} 
                    onChange={(e) => handleAnswer(e.target.value)} 
                    placeholder={question.type === "speaking" ? "Tulis apa yang kamu ucapkan..." : "Tulis jawaban essay..."}
                    className="min-h-[150px] text-lg border-2 border-foreground p-4 font-medium focus-visible:ring-blue-500"
                  />
                  {question.type === "speaking" && <p className="text-xs text-muted-foreground italic text-center">*Gunakan fitur dictation keyboard HP kamu atau ketik manual.</p>}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t-2 border-foreground p-4 grid grid-cols-2 gap-3 sm:flex sm:justify-between">
            <Button onClick={prevQuestion} disabled={currentIdx === 0} variant="outline" className="border-2 border-foreground font-bold h-12 w-full sm:w-auto">
              <ArrowLeft className="mr-2 w-4 h-4" /> <span className="hidden sm:inline">Soal </span>Sebelumnya
            </Button>
            <Button onClick={nextQuestion} className={cn("font-bold border-2 border-transparent h-12 w-full sm:w-auto transition-all shadow-sm active:shadow-none active:translate-y-1", currentIdx === totalQuestions - 1 ? "bg-green-600 hover:bg-green-700 text-white hover:border-green-800" : "bg-foreground text-background hover:bg-foreground/90 hover:border-black")}>
              {currentIdx === totalQuestions - 1 ? <span className="flex items-center">Selesai <CheckCircle2 className="ml-2 w-4 h-4" /></span> : <span className="flex items-center">Selanjutnya <ArrowRight className="ml-2 w-4 h-4" /></span>}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-red-50 border-b-4 border-foreground pb-4 text-center">
              <div className="mx-auto p-3 bg-red-100 rounded-full border-2 border-red-500 text-red-600 w-fit mb-2">
                <AlertTriangle size={32} />
              </div>
              <CardTitle className="text-2xl font-black text-red-600 uppercase">Keluar Ujian?</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-2">
              <p className="font-bold text-lg">Yakin mau menyerah?</p>
              <p className="text-muted-foreground text-sm">Progress ujianmu akan hilang dan tidak disimpan.</p>
            </CardContent>
            <div className="p-6 pt-0 flex gap-3">
              <Button onClick={() => setShowExitConfirm(false)} variant="outline" className="flex-1 border-2 border-foreground font-bold h-12">Batal</Button>
              <Button onClick={confirmExit} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 font-black h-12">YA, KELUAR</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamSimulationPage;