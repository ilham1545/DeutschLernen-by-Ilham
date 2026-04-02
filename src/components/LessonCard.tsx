import { useState } from "react";
import { Check, ChevronDown, ChevronUp, BookOpen, MessageSquare, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LessonCardProps {
  levelId: string;
  subSection: any;
  isComplete: boolean;
  onToggleComplete: (lessonId: string, currentStatus: boolean) => void;
}

const LessonCard = ({ levelId, subSection, isComplete, onToggleComplete }: LessonCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"vocabulary" | "dialog" | "exercise">("vocabulary");
  
  // Kuis murni pakai state (Tanpa LocalStorage sama sekali!)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // --- 🛡️ DATA SANITIZER 🛡️ ---
  const safeVocabs = Array.isArray(subSection.vocabulary) ? subSection.vocabulary : (subSection.vocabularies || []);
  const safeDialogs = Array.isArray(subSection.dialogs) ? subSection.dialogs : [];
  const safeExercises = Array.isArray(subSection.exercises) 
    ? subSection.exercises.map((ex: any) => ({
        ...ex,
        options: typeof ex.options === "string" ? JSON.parse(ex.options) : (ex.options || []),
        correctAnswer: Number(ex.correct_answer || ex.correctAnswer || 0) 
      }))
    : [];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const getScore = () => {
    let correct = 0;
    safeExercises.forEach((exercise: any, index: number) => {
      if (selectedAnswers[index] === exercise.correctAnswer) correct++;
    });
    return correct;
  };

  const tabs = [
    { id: "vocabulary", label: "Kosakata", icon: BookOpen },
    { id: "dialog", label: "Dialog", icon: MessageSquare },
    { id: "exercise", label: "Latihan", icon: Dumbbell }, 
  ] as const;

  return (
    <div className={cn(
      "border-4 border-foreground bg-card transition-all",
      isComplete ? "shadow-md border-green-500" : "shadow-sm hover:shadow-md"
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          {/* Ikon Centang - Bisa dipencet buat Uncheck! */}
          <div 
            onClick={(e) => {
              if (isComplete) {
                e.stopPropagation(); // Biar accordion gak ikutan nutup
                onToggleComplete(subSection.id, isComplete);
              }
            }}
            className={cn(
              "w-8 h-8 border-2 border-foreground flex items-center justify-center transition-all",
              isComplete ? "bg-green-500 text-white border-green-600 cursor-pointer hover:bg-green-600 hover:scale-105 active:scale-95" : "bg-background"
            )}
            title={isComplete ? "Batalkan Selesai (Uncheck)" : ""}
          >
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
          <div className="flex border-b-2 border-foreground overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-[120px] px-4 py-3 font-medium flex items-center justify-center gap-2 transition-colors",
                    activeTab === tab.id ? "bg-foreground text-background" : "bg-background hover:bg-accent"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === "vocabulary" && (
              <div className="grid gap-3">
                {safeVocabs.map((vocab: any, index: number) => (
                  <div key={index} className="border-2 border-foreground p-4 bg-background hover:bg-accent transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="font-bold text-lg">{vocab.german}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{vocab.indonesian}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 italic">"{vocab.example}"</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "dialog" && (
              <div className="space-y-6">
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

            {activeTab === "exercise" && (
              <div className="space-y-6">
                {safeExercises.map((exercise: any, qIndex: number) => (
                  <div key={qIndex} className="border-2 border-foreground p-4">
                    <p className="font-bold mb-4">{qIndex + 1}. {exercise.question}</p>
                    <div className="grid gap-2">
                      {exercise.options.map((option: string, oIndex: number) => {
                        const isSelected = selectedAnswers[qIndex] === oIndex;
                        const isCorrect = exercise.correctAnswer === oIndex;
                        return (
                          <button
                            key={oIndex}
                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                            disabled={showResults}
                            className={cn(
                              "text-left px-4 py-3 border-2 border-foreground transition-all",
                              isSelected && !showResults && "bg-accent hover:bg-slate-200",
                              !isSelected && !showResults && "hover:bg-slate-50 cursor-pointer",
                              showResults && isCorrect && "bg-green-500 text-white border-green-700 opacity-100", 
                              showResults && isSelected && !isCorrect && "bg-red-500 text-white border-red-700 opacity-100", 
                              showResults && !isSelected && !isCorrect && "opacity-40 cursor-not-allowed border-slate-300" 
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
                    <Button onClick={() => setShowResults(true)} disabled={safeExercises.length === 0 || Object.keys(selectedAnswers).length !== safeExercises.length} className="w-full sm:w-auto font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
                      Periksa Jawaban
                    </Button>
                  ) : (
                    <div className="flex items-center gap-4 w-full justify-between sm:justify-start">
                      <div className="px-4 py-2 border-2 border-black bg-yellow-100 font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Skor: {getScore()}/{safeExercises.length}
                      </div>
                      
                      {/* Tombol Ulangi Kuis */}
                      <Button 
                        variant="outline" 
                        onClick={() => { setSelectedAnswers({}); setShowResults(false); }}
                        className="font-bold border-2 border-slate-300 hover:border-black hover:bg-slate-100 transition-colors"
                      >
                        Ulangi Kuis
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Tombol Tandai Selesai (Hanya muncul kalau belum komplit) */}
          {!isComplete && (
            <div className="border-t-2 border-foreground p-4 bg-slate-50">
              <Button 
                onClick={() => onToggleComplete(subSection.id, isComplete)} 
                className="w-full h-12 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all hover:bg-green-600"
              >
                <Check size={20} className="mr-2" /> Tandai Selesai
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonCard;