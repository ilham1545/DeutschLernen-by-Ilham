import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { quizzes } from "@/data/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy, RefreshCcw, ArrowRight, Share2, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const QuizPage = () => {
  const { levelId } = useParams();
  // LOGIKA BARU: Cek dulu ada gak, kalau gak ada JANGAN default ke A1 sembarangan
  const quiz = quizzes[levelId as string]; 

  // Kalo quiz gak ketemu, tampilin pesan error atau redirect balik
  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black mb-4">Waduh! 😅</h1>
        <p className="text-lg text-slate-600 mb-8">Quiz untuk level <span className="font-bold text-red-500">{levelId}</span> belum tersedia saat ini.</p>
        <Link to="/">
          <Button size="lg" className="font-bold border-2 border-black">Kembali ke Home</Button>
        </Link>
      </div>
    );
  }
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  
  // State untuk jawaban user
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [reorderList, setReorderList] = useState<string[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);

  const currentQ = quiz.questions[currentIdx];
  const isFinished = showResult;

  // Init Reorder Question
  useState(() => {
    if (currentQ.type === "reorder") {
      setWordBank([...(currentQ.options || [])].sort(() => Math.random() - 0.5));
    }
  });

  const handleNext = () => {
    // Reset state
    setFeedback(null);
    setSelectedOption(null);
    setTextAnswer("");
    setReorderList([]);
    
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(curr => curr + 1);
      // Init next word bank if needed
      const nextQ = quiz.questions[currentIdx + 1];
      if (nextQ.type === "reorder") {
        setWordBank([...(nextQ.options || [])].sort(() => Math.random() - 0.5));
      }
    } else {
      setShowResult(true);
      if (score / quiz.questions.length > 0.8) fireConfetti();
    }
  };

  const checkAnswer = () => {
    let isCorrect = false;

    if (currentQ.type === "multiple-choice") {
      isCorrect = selectedOption === currentQ.correctAnswer;
    } else if (currentQ.type === "fill-blank") {
      isCorrect = textAnswer.trim().toLowerCase() === (currentQ.correctAnswer as string).toLowerCase();
    } else if (currentQ.type === "reorder") {
      isCorrect = JSON.stringify(reorderList) === JSON.stringify(currentQ.correctAnswer);
    }

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  };

  const fireConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  // --- LOGIKA REORDER (KLIK PINDAH) ---
  const moveWord = (word: string, from: "bank" | "answer") => {
    if (feedback) return; // Freeze jika sudah jawab
    if (from === "bank") {
      setWordBank(prev => prev.filter(w => w !== word));
      setReorderList(prev => [...prev, word]);
    } else {
      setReorderList(prev => prev.filter(w => w !== word));
      setWordBank(prev => [...prev, word]);
    }
  };

  // --- RENDER HASIL (SERTIFIKAT) ---
  if (showResult) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className={cn("w-full max-w-lg border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center overflow-hidden", passed ? "border-yellow-500" : "border-slate-300")}>
          <div className={cn("h-4 w-full", passed ? "bg-yellow-400" : "bg-slate-300")} />
          <CardHeader>
            <div className="mx-auto bg-slate-100 p-4 rounded-full w-fit mb-4">
              {passed ? <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" /> : <RefreshCcw className="w-12 h-12 text-slate-400" />}
            </div>
            <CardTitle className="text-3xl font-black uppercase">{passed ? "Sertifikat Kompetensi" : "Belum Lulus"}</CardTitle>
            <p className="text-muted-foreground">Level {quiz.level}: {quiz.title}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-black">{percentage}%</div>
            
            {passed ? (
              <div className="bg-yellow-50 p-6 border-2 border-yellow-200 rounded-xl relative">
                <Award className="absolute top-2 right-2 text-yellow-300 w-8 h-8" />
                <p className="font-serif italic text-lg text-slate-700">"Dengan ini dinyatakan bahwa User telah menguasai materi dasar bahasa Jerman Level {quiz.level}."</p>
                <p className="mt-4 font-bold text-sm uppercase tracking-widest text-yellow-700">- Deutsch Lernen App -</p>
              </div>
            ) : (
              <p className="text-slate-600">Kamu butuh minimal 80% untuk dapat sertifikat. Jangan menyerah, coba lagi!</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-6 pt-0">
            {passed && (
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold border-2 border-foreground shadow-sm">
                <Share2 className="w-4 h-4 mr-2" /> Bagikan ke Medsos
              </Button>
            )}
            <Button variant="outline" className="w-full font-bold border-2 border-foreground" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
            <Link to="/" className="text-sm font-bold text-muted-foreground hover:underline">Kembali ke Menu</Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- RENDER PERTANYAAN ---
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-foreground">Quiz {quiz.level}</h1>
        <span className="font-bold bg-slate-100 px-3 py-1 rounded border-2 border-foreground">{currentIdx + 1} / {quiz.questions.length}</span>
      </div>
      
      <Progress value={(currentIdx / quiz.questions.length) * 100} className="mb-8 h-3 border-2 border-foreground" />

      <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white min-h-[400px] flex flex-col">
        <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2 block">{currentQ.type.replace("-", " ")}</span>
          <h2 className="text-xl md:text-2xl font-bold mb-8 leading-snug">{currentQ.question}</h2>

          <div className="flex-1 space-y-4">
            
            {/* TIPE 1: MULTIPLE CHOICE */}
            {currentQ.type === "multiple-choice" && (
              <div className="grid gap-3">
                {currentQ.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !feedback && setSelectedOption(opt)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 font-bold transition-all",
                      selectedOption === opt ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 hover:border-slate-400",
                      feedback === "correct" && opt === currentQ.correctAnswer && "bg-green-500 text-white border-green-600",
                      feedback === "wrong" && selectedOption === opt && "bg-red-500 text-white border-red-600"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* TIPE 2: FILL IN THE BLANK */}
            {currentQ.type === "fill-blank" && (
              <div>
                <Input 
                  placeholder="Ketik jawabanmu..." 
                  value={textAnswer}
                  onChange={(e) => !feedback && setTextAnswer(e.target.value)}
                  className="text-lg p-6 border-4 border-slate-200 focus-visible:ring-0 focus-visible:border-slate-800 font-bold"
                  disabled={!!feedback}
                />
                {feedback && (
                  <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded font-bold text-blue-800">
                    Jawaban: {currentQ.correctAnswer as string}
                  </div>
                )}
              </div>
            )}

            {/* TIPE 3: REORDER (DRAG & DROP SIMPLIFIED) */}
            {currentQ.type === "reorder" && (
              <div className="space-y-6">
                {/* Area Jawaban */}
                <div className="min-h-[80px] p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-wrap gap-2">
                  {reorderList.length === 0 && <span className="text-slate-400 font-medium italic self-center">Klik kata di bawah untuk menyusun...</span>}
                  {reorderList.map((word, idx) => (
                    <button key={`${word}-${idx}`} onClick={() => moveWord(word, "answer")} className="px-3 py-2 bg-white border-2 border-slate-800 rounded font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                      {word}
                    </button>
                  ))}
                </div>
                {/* Bank Kata */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {wordBank.map((word, idx) => (
                    <button key={`${word}-${idx}`} onClick={() => moveWord(word, "bank")} className="px-3 py-2 bg-slate-100 border-2 border-slate-300 text-slate-600 rounded font-bold hover:bg-slate-200 transition-colors">
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* FEEDBACK SECTION */}
          {feedback && (
            <div className={cn("mt-6 p-4 rounded-lg border-2 animate-in slide-in-from-bottom-2", feedback === "correct" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800")}>
              <div className="flex items-center gap-2 font-black text-lg mb-1">
                {feedback === "correct" ? <CheckCircle2 /> : <XCircle />}
                {feedback === "correct" ? "Benar Sekali!" : "Kurang Tepat!"}
              </div>
              <p className="font-medium">{currentQ.explanation}</p>
            </div>
          )}

        </CardContent>
        
        <CardFooter className="p-6 bg-slate-50 border-t-2 border-foreground/10">
          {!feedback ? (
            <Button onClick={checkAnswer} className="w-full h-12 text-lg font-black bg-foreground text-background hover:bg-slate-800">
              Periksa Jawaban
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full h-12 text-lg font-black bg-blue-600 hover:bg-blue-700 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-foreground active:shadow-none active:translate-y-1 transition-all">
              Lanjut <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizPage;