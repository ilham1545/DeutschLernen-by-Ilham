import { useState } from "react";
import { Check, ChevronDown, ChevronUp, BookOpen, MessageSquare, PenTool, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
// Hapus import interface SubSection dari data/lessons jika bikin konflik, kita pakai any dulu biar aman
import { saveProgress, isSubSectionComplete } from "@/utils/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LessonCardProps {
  levelId: string;
  subSection: any; // Ganti ke any biar fleksibel nerima data dari Supabase
  onProgressUpdate: () => void;
}

const LessonCard = ({ levelId, subSection, onProgressUpdate }: LessonCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"vocabulary" | "dialog" | "exercise">("vocabulary");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  
  const isComplete = isSubSectionComplete(levelId, subSection.id);
  const { toast } = useToast();

  // --- 🛡️ DATA SANITIZER (BAGIAN INI YANG MEMPERBAIKI ERROR) 🛡️ ---
  // Kita pastikan data selalu berupa Array, walau dari database null/undefined/string
  
  const safeVocabs = Array.isArray(subSection.vocabulary) 
    ? subSection.vocabulary 
    : (subSection.vocabularies || []);

  const safeDialogs = Array.isArray(subSection.dialogs) 
    ? subSection.dialogs 
    : [];

  const safeExercises = Array.isArray(subSection.exercises) 
    ? subSection.exercises.map((ex: any) => ({
        ...ex,
        // Cek: kalau options bentuknya string, kita parse jadi JSON. Kalau array, biarin.
        options: typeof ex.options === "string" ? JSON.parse(ex.options) : (ex.options || []),
        // Pastikan correctAnswer berupa angka
        correctAnswer: Number(ex.correct_answer || ex.correctAnswer || 0) 
      }))
    : [];
  // ------------------------------------------------------------------

  const handleMarkComplete = () => {
    saveProgress(levelId, subSection.id);
    onProgressUpdate();
    toast({
      title: "Selamat! 🎉",
      description: `Sub-bab "${subSection.title}" telah ditandai selesai.`,
    });
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const getScore = () => {
    let correct = 0;
    safeExercises.forEach((exercise: any, index: number) => {
      if (selectedAnswers[index] === exercise.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const tabs = [
    { id: "vocabulary", label: "Kosakata", icon: BookOpen },
    { id: "dialog", label: "Dialog", icon: MessageSquare },
    { id: "exercise", label: "Latihan", icon: Volume2 },
  ] as const;

  return (
    <div className={cn(
      "border-4 border-foreground bg-card transition-all",
      isComplete ? "shadow-md" : "shadow-sm hover:shadow-md"
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-8 h-8 border-2 border-foreground flex items-center justify-center",
            isComplete ? "bg-foreground text-background" : "bg-background"
          )}>
            {isComplete && <Check size={18} />}
          </div>
          <div>
            <h3 className="font-bold text-lg">{subSection.title}</h3>
            <p className="text-sm text-muted-foreground">
              {safeVocabs.length} kata • {safeExercises.length} latihan
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t-4 border-foreground">
          {/* Tabs */}
          <div className="flex border-b-2 border-foreground overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-[120px] px-4 py-3 font-medium flex items-center justify-center gap-2 transition-colors",
                    activeTab === tab.id
                      ? "bg-foreground text-background"
                      : "bg-background hover:bg-accent"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {/* --- VOCABULARY TAB --- */}
            {activeTab === "vocabulary" && (
              <div className="grid gap-3">
                {safeVocabs.length === 0 && <p className="text-slate-400 italic">Belum ada kosakata.</p>}
                {safeVocabs.map((vocab: any, index: number) => (
                  <div
                    key={index}
                    className="border-2 border-foreground p-4 bg-background hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="font-bold text-lg">{vocab.german}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{vocab.indonesian}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{vocab.example}"
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* --- DIALOG TAB --- */}
            {activeTab === "dialog" && (
              <div className="space-y-6">
                {safeDialogs.length === 0 && <p className="text-slate-400 italic">Belum ada dialog.</p>}
                {safeDialogs.map((dialog: any, index: number) => (
                  <div key={index} className="border-2 border-foreground p-4">
                    <h4 className="font-bold text-lg mb-4 bg-foreground text-background px-3 py-1 inline-block">
                      {dialog.title}
                    </h4>
                    <div className="space-y-3">
                      {(dialog.dialog_lines || dialog.lines || []).map((line: any, i: number) => (
                        <div key={i} className="border-l-4 border-foreground pl-4">
                          <p className="font-bold text-sm">{line.speaker}:</p>
                          <p className="font-medium">{line.german}</p>
                          <p className="text-sm text-muted-foreground italic">{line.indonesian}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- EXERCISE TAB --- */}
            {activeTab === "exercise" && (
              <div className="space-y-6">
                {safeExercises.length === 0 && <p className="text-slate-400 italic">Belum ada latihan.</p>}
                {safeExercises.map((exercise: any, qIndex: number) => (
                  <div key={qIndex} className="border-2 border-foreground p-4">
                    <p className="font-bold mb-4">
                      {qIndex + 1}. {exercise.question}
                    </p>
                    <div className="grid gap-2">
                      {/* Sekarang aman untuk di-map karena sudah dibersihkan di safeExercises */}
                      {exercise.options.map((option: string, oIndex: number) => {
                        const isSelected = selectedAnswers[qIndex] === oIndex;
                        const isCorrect = exercise.correctAnswer === oIndex;
                        const showCorrectness = showResults && isSelected;
                        
                        return (
                          <button
                            key={oIndex}
                            onClick={() => !showResults && handleAnswerSelect(qIndex, oIndex)}
                            disabled={showResults}
                            className={cn(
                              "text-left px-4 py-3 border-2 border-foreground transition-all",
                              isSelected && !showResults && "bg-accent",
                              showResults && isCorrect && "bg-foreground text-background",
                              showCorrectness && !isCorrect && "bg-destructive text-destructive-foreground",
                              showResults && isCorrect && !isSelected && "border-dashed"
                            )}
                          >
                            <span className="font-mono mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t-2 border-foreground">
                  {!showResults ? (
                    <Button
                      onClick={checkAnswers}
                      disabled={safeExercises.length === 0 || Object.keys(selectedAnswers).length !== safeExercises.length}
                      className="w-full sm:w-auto"
                    >
                      Periksa Jawaban
                    </Button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">
                        Skor: {getScore()}/{safeExercises.length}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAnswers({});
                          setShowResults(false);
                        }}
                      >
                        Coba Lagi
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mark Complete Button */}
          {!isComplete && (
            <div className="border-t-2 border-foreground p-4">
              <Button
                onClick={handleMarkComplete}
                className="w-full"
                size="lg"
              >
                <Check size={18} className="mr-2" />
                Tandai Selesai
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonCard;