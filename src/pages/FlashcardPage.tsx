import { useState, useEffect, useCallback } from "react";
// Import Icon lengkap
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, List, Layers, Trash2, Volume2, Loader2, Check, Bookmark } from "lucide-react";
// PENTING: Import Tipe Data saja
import { Vocabulary } from "@/data/lessons"; 
import { saveLastCardPosition, loadLastCardPosition } from "@/utils/progress";
import FlashCard from "@/components/FlashCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/hooks/useDictionary"; 
// Import Card component untuk tampilan List
import { Card, CardContent } from "@/components/ui/card";
import { useActivityLog } from "@/hooks/useActivityLog";
// Import Supabase & Toast
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Daftar Level
const AVAILABLE_LEVELS = ["A1", "A2", "B1", "B2"];

const FlashcardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [currentIndex, setCurrentIdx] = useState(0);
  const [flashcards, setFlashcards] = useState<Vocabulary[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State Mode Tampilan
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");

  // Panggil Hook Dictionary (Untuk Bookmark)
  const { saveWord, isSaved, words, removeWord } = useDictionary();
  const { logActivity } = useActivityLog();

  // State lokal untuk melacak kata yang "Sudah Tahu" di sesi ini (biar UI responsif)
  const [knownWordsSet, setKnownWordsSet] = useState<Set<string>>(new Set());

  // Filter kata BOOKMARK per Level (bukan known words)
  const savedWordsForLevel = words.filter(w => w.source === `Flashcard ${selectedLevel}`);

  // --- 1. FETCH DATA DARI DATABASE ---
  useEffect(() => {
    const fetchVocabularies = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("vocabularies")
          .select(`
            german,
            indonesian,
            example,
            lessons!inner (
              level_id
            )
          `)
          .eq("lessons.level_id", selectedLevel);

        if (error) throw error;

        if (data) {
          const vocabList: Vocabulary[] = data.map((item: any) => ({
            german: item.german,
            indonesian: item.indonesian,
            example: item.example || ""
          }));

          setFlashcards(vocabList);

          // Load posisi terakhir
          if (viewMode === "deck") {
            const savedIndex = loadLastCardPosition(selectedLevel);
            setCurrentIdx(Math.min(savedIndex, Math.max(0, vocabList.length - 1)));
          }
        }
        
        // Load Known Words user untuk level ini (biar tombol ceklis nyala kalau udah tau)
        if (user) {
            const { data: knownData } = await supabase
                .from('user_known_words')
                .select('german')
                .eq('user_id', user.id);
            
            if (knownData) {
                setKnownWordsSet(new Set(knownData.map(k => k.german)));
            }
        }

      } catch (err) {
        console.error("Gagal mengambil flashcard:", err);
      } finally {
        setIsLoading(false);
        setIsShuffled(false);
      }
    };

    fetchVocabularies();
  }, [selectedLevel, user]); 

  // Simpan posisi terakhir
  useEffect(() => {
    if (flashcards.length > 0 && viewMode === "deck") {
      saveLastCardPosition(selectedLevel, currentIndex);
    }
  }, [currentIndex, selectedLevel, flashcards.length, viewMode]);

  // --- LOGIKA NAVIGASI KARTU ---
  const goToNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  }, [currentIndex, flashcards.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToRandom = useCallback(() => {
    if (flashcards.length > 0) {
      const randomIndex = Math.floor(Math.random() * flashcards.length);
      setCurrentIdx(randomIndex);
    }
  }, [flashcards.length]);

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIdx(0);
    setIsShuffled(true);
  };

  const resetOrder = async () => {
    setIsLoading(true);
    const { data } = await supabase
        .from("vocabularies")
        .select("german, indonesian, example, lessons!inner(level_id)")
        .eq("lessons.level_id", selectedLevel);
    
    if (data) {
        const vocabList: Vocabulary[] = data.map((item: any) => ({
            german: item.german,
            indonesian: item.indonesian,
            example: item.example || ""
        }));
        setFlashcards(vocabList);
    }
    setCurrentIdx(0);
    setIsShuffled(false);
    setIsLoading(false);
  };

  // --- LOGIKA BOOKMARK (Simpan ke saved_words) ---
  const handleBookmark = () => {
    const currentCard = flashcards[currentIndex]; 
    if (currentCard) {
      if (isSaved(currentCard.german)) {
        const wordToDelete = words.find(w => w.german === currentCard.german);
        if (wordToDelete) {
          removeWord(wordToDelete.id);
        }
      } else {
         saveWord(currentCard.german, currentCard.indonesian, `Flashcard ${selectedLevel}`);
         logActivity("word", `Menyimpan flashcard "${currentCard.german}" (${selectedLevel})`);
      }
    }
  };

  // --- LOGIKA SUDAH TAHU (Simpan ke user_known_words) ---
  const handleMarkAsKnown = async () => {
      const currentCard = flashcards[currentIndex];
      if (!currentCard || !user) return;

      const isKnown = knownWordsSet.has(currentCard.german);

      if (isKnown) {
          // Kalau udah tau, mau di-undo? (Hapus dari DB)
          const { error } = await supabase
              .from('user_known_words')
              .delete()
              .eq('user_id', user.id)
              .eq('german', currentCard.german);
          
          if (!error) {
              const newSet = new Set(knownWordsSet);
              newSet.delete(currentCard.german);
              setKnownWordsSet(newSet);
              toast({ title: "Dihapus dari hafalan ❌" });
          }
      } else {
          // Tandai sudah tahu (Insert ke DB)
          const { error } = await supabase
              .from('user_known_words')
              .insert({ user_id: user.id, german: currentCard.german });
          
          if (!error) {
              const newSet = new Set(knownWordsSet);
              newSet.add(currentCard.german);
              setKnownWordsSet(newSet);
              toast({ title: "Kata Dikuasai! 🎉", description: "Masuk ke total hafalan." });
              
              // Opsional: Otomatis geser ke next card kalau belum di akhir
              if (currentIndex < flashcards.length - 1) {
                  setTimeout(() => goToNext(), 500);
              }
          }
      }
  };
  
  const playAudio = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    window.speechSynthesis.speak(u);
  };

  // Keyboard navigation
  useEffect(() => {
    if (viewMode === "list") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "r" || e.key === "R") goToRandom();
      if (e.key === "s" || e.key === "S") handleBookmark(); 
      if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleMarkAsKnown(); // Spasi/Enter buat checklist
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, goToRandom, handleMarkAsKnown, currentIndex, flashcards, viewMode]);

  const currentCard = flashcards[currentIndex];
  const isCardKnown = currentCard ? knownWordsSet.has(currentCard.german) : false;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b-4 border-foreground bg-secondary sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4"> 
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-0">
                <span className="bg-foreground text-background px-4 py-1">FLASHCARD</span>
            </h1>

            {/* KONTROL LEVEL & MODE TAMPILAN */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2">
                    {AVAILABLE_LEVELS.map((lvl) => (
                    <button
                        key={lvl}
                        onClick={() => { setSelectedLevel(lvl); setCurrentIdx(0); setViewMode("deck"); }}
                        className={cn(
                        "px-3 py-1 font-bold border-4 border-foreground transition-all text-sm",
                        selectedLevel === lvl
                            ? "bg-foreground text-background shadow-sm"
                            : "bg-card hover:bg-accent"
                        )}
                    >
                        {lvl}
                    </button>
                    ))}
                </div>

                <div className="h-8 w-1 bg-foreground/20 hidden md:block"></div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("deck")}
                        className={cn(
                            "p-2 border-2 border-foreground rounded font-bold flex items-center gap-2 transition-all",
                            viewMode === "deck" ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent opacity-50 hover:opacity-100"
                        )}
                        title="Mode Kartu"
                    >
                        <Layers size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "p-2 border-2 border-foreground rounded font-bold flex items-center gap-2 transition-all relative",
                            viewMode === "list" ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent opacity-50 hover:opacity-100"
                        )}
                        title="Daftar Disimpan"
                    >
                        <List size={20} />
                        {savedWordsForLevel.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-black font-bold">
                                {savedWordsForLevel.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>
          </div>
          
          {isShuffled && viewMode === "deck" && (
            <div className="mt-2 inline-block px-3 py-1 bg-accent border-2 border-foreground text-xs font-bold">
              🔀 ACAK
            </div>
          )}
        </div>
      </section>

      {/* Progress Bar Area (Hanya Muncul di Mode Deck) */}
      {viewMode === "deck" && !isLoading && (
        <section className="container mx-auto px-4">
            {flashcards.length > 0 ? (
            <>
                <div className="mt-8 max-w-lg mx-auto">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Kartu {currentIndex + 1}</span>
                    <span>{flashcards.length} total</span>
                </div>
                <div className="h-3 bg-accent border-2 border-foreground">
                    <div
                    className="h-full bg-foreground transition-all"
                    style={{
                        width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                    }}
                    />
                </div>
                </div>
            </>
            ) : (
            <div className="text-center py-12 border-4 border-foreground mt-8">
                <p className="text-xl text-muted-foreground">Tidak ada flashcard untuk level ini.</p>
            </div>
            )}
        </section>
      )}

      {/* MAIN CONTENT AREA */}
      <section className="container mx-auto px-4 py-12">
        
        {/* === LOADING SPINNER === */}
        {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-slate-400 mb-4" />
                <p className="font-bold text-slate-500">Menyiapkan kartu...</p>
            </div>
        )}

        {/* === MODE 1: DECK (KARTU) === */}
        {!isLoading && viewMode === "deck" && flashcards.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <FlashCard
              key={`${selectedLevel}-${currentIndex}-${flashcards[currentIndex]?.german}`}
              vocabulary={flashcards[currentIndex]}
              index={currentIndex}
              total={flashcards.length}
              isBookmarked={isSaved(flashcards[currentIndex]?.german)}
              onBookmark={handleBookmark}
            />

            {/* ACTION BUTTONS (NEW: Tombol Ceklis) */}
            <div className="mt-6 flex justify-center gap-4 max-w-lg mx-auto">
                 <Button 
                    onClick={handleMarkAsKnown}
                    className={cn(
                        "w-full h-12 text-lg font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none",
                        isCardKnown 
                            ? "bg-green-100 text-green-700 border-green-600 hover:bg-green-200" 
                            : "bg-white text-black border-black hover:bg-green-50"
                    )}
                 >
                    {isCardKnown ? (
                        <><Check className="w-6 h-6 mr-2" /> Sudah Hafal</>
                    ) : (
                        <><Check className="w-6 h-6 mr-2 opacity-30" /> Tandai Hafal</>
                    )}
                 </Button>
            </div>

            {/* Navigation Controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto"
              >
                <ChevronLeft size={20} className="mr-2" />
                Sebelumnya
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={goToRandom}
                className="w-full sm:w-auto"
              >
                <Shuffle size={20} className="mr-2" />
                Acak
              </Button>
              
              <Button
                size="lg"
                onClick={goToNext}
                disabled={currentIndex === flashcards.length - 1}
                className="w-full sm:w-auto"
              >
                Selanjutnya
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="mt-6 flex justify-center gap-4">
              {!isShuffled ? (
                <Button variant="outline" onClick={shuffleCards}>
                  <Shuffle size={16} className="mr-2" />
                  Acak Semua Kartu
                </Button>
              ) : (
                <Button variant="outline" onClick={resetOrder}>
                  <RotateCcw size={16} className="mr-2" />
                  Reset Urutan
                </Button>
              )}
            </div>

            {/* Keyboard Hints */}
            <div className="mt-8 text-center text-sm text-muted-foreground hidden lg:block">
              <p className="font-mono">
                Navigasi: <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">←</kbd>
                <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">→</kbd> 
                | <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">Spasi</kbd> Hafal
                | <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">S</kbd> Bookmark
              </p>
            </div>
          </div>
        )}

        {/* === MODE 2: LIST (DAFTAR SIMPANAN) === */}
        {!isLoading && viewMode === "list" && (
            <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-6 flex justify-between items-end border-b-2 border-slate-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase">Disimpan ({selectedLevel})</h2>
                        <p className="text-slate-500 text-sm">Kata sulit yang kamu bookmark.</p>
                    </div>
                </div>

                {savedWordsForLevel.length > 0 ? (
                    <div className="grid gap-3">
                        {savedWordsForLevel.map((word) => (
                            <Card key={word.id} className="border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => playAudio(word.german)}
                                            className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                        <div>
                                            <h3 className="text-lg font-black">{word.german}</h3>
                                            <p className="text-slate-500 font-medium">{word.indo}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => removeWord(word.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-xl">
                        <Bookmark className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-500 font-bold">Belum ada bookmark di Level {selectedLevel}.</p>
                        <Button 
                            variant="link" 
                            className="mt-2 text-blue-600 font-bold"
                            onClick={() => setViewMode("deck")}
                        >
                            Kembali ke Kartu
                        </Button>
                    </div>
                )}
            </div>
        )}

      </section>
    </div>
  );
};

export default FlashcardPage;