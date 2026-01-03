import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, List, Layers, Trash2, Volume2, Loader2, Check, Filter, ChevronDown } from "lucide-react";
import { Vocabulary } from "@/data/lessons"; 
import { saveLastCardPosition, loadLastCardPosition } from "@/utils/progress";
import FlashCard from "@/components/FlashCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/hooks/useDictionary"; 
import { Card, CardContent } from "@/components/ui/card";
import { useActivityLog } from "@/hooks/useActivityLog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AVAILABLE_LEVELS = ["A1", "A2", "B1", "B2"];

// DATA KATEGORI + WARNA CHAMELEON 🦎
const CATEGORIES = [
  { id: "all", label: "Semua Kategori", color: "bg-white text-slate-700 border-foreground" },
  { id: "noun", label: "Nomen (Benda)", color: "bg-blue-100 text-blue-700 border-blue-500" },
  { id: "verb", label: "Verben (Kerja)", color: "bg-red-100 text-red-700 border-red-500" },
  { id: "adjective", label: "Adjektiv (Sifat)", color: "bg-yellow-100 text-yellow-700 border-yellow-500" },
  { id: "phrase", label: "Frasa & Kalimat", color: "bg-purple-100 text-purple-700 border-purple-500" },
  { id: "adverb", label: "Lainnya", color: "bg-emerald-100 text-emerald-700 border-emerald-500" },
];

const FlashcardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [refreshKey, setRefreshKey] = useState(0); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // FIX: Pisahkan Ref untuk Mobile dan Desktop biar gak bentrok
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIdx] = useState(0);
  const [flashcards, setFlashcards] = useState<Vocabulary[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");

  const { saveWord, isSaved, words, removeWord } = useDictionary();
  const { logActivity } = useActivityLog();
  const [knownWordsSet, setKnownWordsSet] = useState<Set<string>>(new Set());

  const savedWordsForLevel = words.filter(w => w.source === `Flashcard ${selectedLevel}`);

  // Helper Warna Aktif (Chameleon Logic)
  const activeCategoryColor = CATEGORIES.find(c => c.id === selectedCategory)?.color || "bg-white text-slate-700 border-foreground";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Cek apakah klik terjadi di dalam dropdown Mobile ATAU Desktop
      const clickedInsideMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(target);
      const clickedInsideDesktop = desktopDropdownRef.current && desktopDropdownRef.current.contains(target);

      if (!clickedInsideMobile && !clickedInsideDesktop) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchVocabularies = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("vocabularies")
          .select(`
            german, 
            indonesian, 
            example, 
            category,
            lessons!inner (
              level_id,
              order_index
            )
          `)
          .eq("lessons.level_id", selectedLevel)
          .order('order_index', { foreignTable: 'lessons', ascending: true });

        if (selectedCategory !== "all") {
             if (selectedCategory === "adverb") {
                 query = query.in("category", ["adverb", "other"]);
             } else {
                 query = query.eq("category", selectedCategory);
             }
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const vocabList: Vocabulary[] = data.map((item: any) => ({
            german: item.german,
            indonesian: item.indonesian,
            example: item.example || "",
            category: item.category
          }));

          setFlashcards(vocabList);
          
          if (viewMode === "deck") {
            const savedIndex = loadLastCardPosition(selectedLevel);
            setCurrentIdx(selectedCategory === 'all' ? Math.min(savedIndex, Math.max(0, vocabList.length - 1)) : 0);
          }
        }
        
        if (user) {
            const { data: knownData } = await supabase.from('user_known_words').select('german').eq('user_id', user.id);
            if (knownData) setKnownWordsSet(new Set(knownData.map(k => k.german)));
        }

      } catch (err) {
        console.error("Gagal ambil flashcard:", err);
      } finally {
        setIsLoading(false);
        setIsShuffled(false);
      }
    };
    fetchVocabularies();
  }, [selectedLevel, selectedCategory, user, refreshKey]);

  useEffect(() => {
    if (flashcards.length > 0 && viewMode === "deck" && selectedCategory === "all" && !isShuffled) {
      saveLastCardPosition(selectedLevel, currentIndex);
    }
  }, [currentIndex, selectedLevel, flashcards.length, viewMode, selectedCategory, isShuffled]);

  const goToNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) setCurrentIdx((prev) => prev + 1);
  }, [currentIndex, flashcards.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) setCurrentIdx((prev) => prev - 1);
  }, [currentIndex]);

  const goToRandom = useCallback(() => {
    if (flashcards.length > 0) setCurrentIdx(Math.floor(Math.random() * flashcards.length));
  }, [flashcards.length]);

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIdx(0);
    setIsShuffled(true);
  };

  const resetOrder = async () => {
    setFlashcards([]);
    setCurrentIdx(0);
    setIsShuffled(false);
    setRefreshKey(prev => prev + 1); 
  };

  const handleBookmark = () => {
    const currentCard = flashcards[currentIndex]; 
    if (currentCard) {
      if (isSaved(currentCard.german)) {
        const wordToDelete = words.find(w => w.german === currentCard.german);
        if (wordToDelete) removeWord(wordToDelete.id);
      } else {
         saveWord(currentCard.german, currentCard.indonesian, `Flashcard ${selectedLevel}`);
         logActivity("word", `Menyimpan flashcard "${currentCard.german}" (${selectedLevel})`);
      }
    }
  };

  const handleMarkAsKnown = async () => {
      const currentCard = flashcards[currentIndex];
      if (!currentCard || !user) return;
      const isKnown = knownWordsSet.has(currentCard.german);

      if (isKnown) {
          const { error } = await supabase.from('user_known_words').delete().eq('user_id', user.id).eq('german', currentCard.german);
          if (!error) {
              const newSet = new Set(knownWordsSet);
              newSet.delete(currentCard.german);
              setKnownWordsSet(newSet);
              toast({ title: "Dihapus dari hafalan ❌" });
          }
      } else {
          const { error } = await supabase.from('user_known_words').insert({ user_id: user.id, german: currentCard.german });
          if (!error) {
              const newSet = new Set(knownWordsSet);
              newSet.add(currentCard.german);
              setKnownWordsSet(newSet);
              toast({ title: "Kata Dikuasai! 🎉" });
              if (currentIndex < flashcards.length - 1) setTimeout(() => goToNext(), 500);
          }
      }
  };
  
  const playAudio = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (viewMode === "list") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "r" || e.key === "R") goToRandom();
      if (e.key === "s" || e.key === "S") handleBookmark(); 
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleMarkAsKnown(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, goToRandom, handleMarkAsKnown, currentIndex, flashcards, viewMode]);

  const currentCard = flashcards[currentIndex];
  const isCardKnown = currentCard ? knownWordsSet.has(currentCard.german) : false;

  return (
    <div className="min-h-screen">
      
      {/* ========================================================= */}
      {/* 📱 HEADER KHUSUS MOBILE (< 768px)                         */}
      {/* ========================================================= */}
      <section className="block md:hidden border-b-4 border-foreground bg-secondary sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-3">
                
                {/* Baris Atas: Judul & Action Buttons */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-foreground text-background px-4 py-1">
                        FLASHCARD
                    </h1>

                    <div className="flex gap-2">
                        {/* 1. Mobile Filter Button (Chameleon 🦎) */}
                        <div className="relative z-50" ref={mobileDropdownRef}>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center border-2 rounded font-bold transition-all shadow-sm",
                                    // 🔥 WARNA BERUBAH DISINI:
                                    activeCategoryColor,
                                    isFilterOpen && "ring-2 ring-foreground"
                                )}
                            >
                                <Filter size={18} />
                            </button>

                            {/* Dropdown Menu */}
                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border-2 border-foreground rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden max-h-[300px] overflow-y-auto">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setSelectedCategory(cat.id); setCurrentIdx(0); setIsFilterOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-100 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0",
                                                selectedCategory === cat.id ? "bg-slate-100 text-blue-600" : "text-slate-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-3 h-3 rounded-full border border-slate-300", cat.color.split(' ')[0])}></div>
                                                {cat.label}
                                            </div>
                                            {selectedCategory === cat.id && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Buttons */}
                        <button
                            onClick={() => setViewMode("deck")}
                            className={cn("w-10 h-10 border-2 border-foreground rounded font-bold flex items-center justify-center", viewMode === "deck" ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent opacity-50")}
                        >
                            <Layers size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn("w-10 h-10 border-2 border-foreground rounded font-bold flex items-center justify-center relative", viewMode === "list" ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent opacity-50")}
                        >
                            <List size={18} />
                            {savedWordsForLevel.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-black font-bold">
                                    {savedWordsForLevel.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Baris Bawah: Level Selector */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {AVAILABLE_LEVELS.map((lvl) => (
                    <button
                        key={lvl}
                        onClick={() => { setSelectedLevel(lvl); setCurrentIdx(0); setViewMode("deck"); }}
                        className={cn(
                        "flex-1 px-3 py-2 font-bold border-2 border-foreground transition-all text-xs text-center whitespace-nowrap",
                        selectedLevel === lvl ? "bg-foreground text-background shadow-sm" : "bg-white hover:bg-accent"
                        )}
                    >
                        {lvl}
                    </button>
                    ))}
                </div>
            </div>
            
            {isShuffled && viewMode === "deck" && (
                <div className="mt-2 flex justify-center">
                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 border-2 border-orange-200 text-xs font-bold rounded-full animate-pulse">
                        🔀 ACAK
                    </div>
                </div>
            )}
        </div>
      </section>


      {/* ========================================================= */}
      {/* 🖥️ HEADER KHUSUS DESKTOP (>= 768px)                       */}
      {/* ========================================================= */}
      <section className="hidden md:block border-b-4 border-foreground bg-secondary sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4"> 
          <div className="flex items-center justify-between gap-4">
            
            {/* KIRI: Judul & Level */}
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-foreground text-background px-4 py-1">
                    FLASHCARD
                </h1>
                <div className="flex gap-2">
                    {AVAILABLE_LEVELS.map((lvl) => (
                    <button
                        key={lvl}
                        onClick={() => { setSelectedLevel(lvl); setCurrentIdx(0); setViewMode("deck"); }}
                        className={cn(
                        "px-4 py-1.5 font-bold border-4 border-foreground transition-all text-sm hover:-translate-y-0.5",
                        selectedLevel === lvl ? "bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-accent"
                        )}
                    >
                        {lvl}
                    </button>
                    ))}
                </div>
            </div>

            {/* KANAN: Filter & Mode */}
            <div className="flex items-center gap-3">
                {/* Desktop Filter Dropdown (Menggunakan Ref Terpisah) */}
                <div className="relative z-50" ref={desktopDropdownRef}>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={cn(
                            "w-[220px] flex items-center justify-between gap-2 px-4 py-2 bg-white border-2 border-foreground rounded font-bold hover:bg-slate-50 transition-colors shadow-sm",
                            isFilterOpen && "ring-2 ring-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-slate-500" />
                            <span className="text-sm truncate">
                                {CATEGORIES.find(c => c.id === selectedCategory)?.label || "Filter"}
                            </span>
                        </div>
                        <ChevronDown size={16} className={cn("transition-transform", isFilterOpen ? "rotate-180" : "")} />
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-[240px] bg-white border-2 border-foreground rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-100 overflow-hidden max-h-[300px] overflow-y-auto">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.id); setCurrentIdx(0); setIsFilterOpen(false); }}
                                    className={cn(
                                        "w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-100 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0",
                                        selectedCategory === cat.id ? "bg-slate-100 text-blue-600" : "text-slate-700"
                                    )}
                                >
                                    {cat.label}
                                    {selectedCategory === cat.id && <Check size={16} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-8 w-0.5 bg-foreground/20"></div>

                {/* Desktop View Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("deck")}
                        className={cn("px-4 py-2 border-2 border-foreground rounded font-bold transition-all flex items-center gap-2", viewMode === "deck" ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent opacity-50 hover:opacity-100")}
                    >
                        <Layers size={18} />
                        <span className="text-sm uppercase">Kartu</span>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("px-4 py-2 border-2 border-foreground rounded font-bold transition-all flex items-center gap-2 relative", viewMode === "list" ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent opacity-50 hover:opacity-100")}
                    >
                        <List size={18} />
                        <span className="text-sm uppercase">List</span>
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
            <div className="mt-2 flex justify-center">
                 <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 border-2 border-orange-200 text-xs font-bold rounded-full animate-pulse">
                    🔀 MODE ACAK AKTIF
                 </div>
            </div>
          )}
        </div>
      </section>

      {/* Progress Bar Area (Deck Mode Only) */}
      {viewMode === "deck" && !isLoading && (
        <section className="container mx-auto px-4">
            {flashcards.length > 0 ? (
            <>
                <div className="mt-6 md:mt-8 max-w-lg mx-auto">
                    <div className="flex justify-between text-xs md:text-sm text-muted-foreground mb-2">
                        <span>Kartu {currentIndex + 1} <span className="text-[10px] text-slate-400">({CATEGORIES.find(c => c.id === selectedCategory)?.label})</span></span>
                        <span>{flashcards.length} total</span>
                    </div>
                    <div className="h-2 md:h-3 bg-accent border-2 border-foreground">
                        <div className="h-full bg-foreground transition-all" style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }} />
                    </div>
                </div>
            </>
            ) : (
            <div className="text-center py-12 border-4 border-foreground mt-8 bg-white">
                <p className="text-xl text-muted-foreground font-bold">Tidak ada kata untuk kategori ini.</p>
                <p className="text-sm text-slate-400 mt-2">Coba ganti filter kategori.</p>
            </div>
            )}
        </section>
      )}

      {/* CONTENT AREA */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-slate-400 mb-4" />
                <p className="font-bold text-slate-500">Menyiapkan kartu...</p>
            </div>
        )}

        {!isLoading && viewMode === "deck" && flashcards.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <FlashCard
              key={`${selectedLevel}-${selectedCategory}-${currentIndex}`}
              vocabulary={flashcards[currentIndex]}
              index={currentIndex}
              total={flashcards.length}
              isBookmarked={isSaved(flashcards[currentIndex]?.german)}
              onBookmark={handleBookmark}
            />

            <div className="mt-6 flex justify-center gap-4 max-w-lg mx-auto">
                  <Button 
                    onClick={handleMarkAsKnown}
                    className={cn(
                        "w-full h-12 text-lg font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none",
                        isCardKnown ? "bg-green-100 text-green-700 border-green-600 hover:bg-green-200" : "bg-white text-black border-black hover:bg-green-50"
                    )}
                  >
                    {isCardKnown ? <><Check className="w-6 h-6 mr-2" /> Sudah Hafal</> : <><Check className="w-6 h-6 mr-2 opacity-30" /> Tandai Hafal</>}
                  </Button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" size="lg" onClick={goToPrevious} disabled={currentIndex === 0} className="w-full sm:w-auto"><ChevronLeft size={20} className="mr-2" /> Sebelumnya</Button>
              <Button variant="outline" size="lg" onClick={goToRandom} className="w-full sm:w-auto"><Shuffle size={20} className="mr-2" /> Acak</Button>
              <Button size="lg" onClick={goToNext} disabled={currentIndex === flashcards.length - 1} className="w-full sm:w-auto">Selanjutnya <ChevronRight size={20} className="ml-2" /></Button>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              {!isShuffled ? (
                <Button variant="outline" onClick={shuffleCards}><Shuffle size={16} className="mr-2" /> Acak Semua Kartu</Button>
              ) : (
                <Button variant="outline" onClick={resetOrder}><RotateCcw size={16} className="mr-2" /> Reset Urutan</Button>
              )}
            </div>
            
             <div className="mt-8 text-center text-sm text-muted-foreground hidden lg:block">
              <p className="font-mono">
                Navigasi: <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">←</kbd> <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">→</kbd> | <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">Spasi</kbd> Hafal | <kbd className="px-2 py-1 bg-accent border rounded text-xs mx-1">S</kbd> Bookmark
              </p>
            </div>
          </div>
        )}

        {/* LIST MODE */}
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
                                        <button onClick={() => playAudio(word.german)} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"><Volume2 size={18} /></button>
                                        <div><h3 className="text-lg font-black">{word.german}</h3><p className="text-slate-500 font-medium">{word.indo}</p></div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 hover:bg-red-50" onClick={() => removeWord(word.id)}><Trash2 size={18} /></Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-xl">
                        <List className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-500 font-bold">Belum ada kata disimpan di Level {selectedLevel}.</p>
                        <Button variant="link" className="mt-2 text-blue-600 font-bold" onClick={() => setViewMode("deck")}>Kembali ke Kartu</Button>
                    </div>
                )}
            </div>
        )}
      </section>
    </div>
  );
};

export default FlashcardPage;