import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, List, Layers, Trash2, Volume2, Loader2, Check, Filter, ChevronDown, Bookmark, Brain, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
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

const VIEW_MODES = [
  { id: "deck", icon: Layers, label: "Kartu" },
  { id: "list", icon: Bookmark, label: "Tersimpan" },
  { id: "practice", icon: Brain, label: "Latihan" }
];

// TIPS JITU SUPER LENGKAP DER DIE DAS
const TIPS_DATA = {
    der: {
        title: "Tips Rahasia: DER (Maskulin)",
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-800",
        icon: "text-blue-600",
        points: [
            <><strong>Orang laki-laki & Profesi pria:</strong> der Vater, der Arzt, der Lehrer.</>,
            <><strong>Waktu (Hari, Bulan, Musim):</strong> der Montag, der Mai, der Sommer.</>,
            <><strong>Arah Mata Angin & Cuaca:</strong> der Norden, der Regen, der Schnee.</>,
            <><strong>Merek Mobil:</strong> der Audi, der BMW, der VW.</>,
            <><strong>Akhiran Spesifik:</strong> <code>-er</code>, <code>-ig</code>, <code>-ling</code>, <code>-ismus</code>, <code>-or</code>, <code>-ant</code>, <code>-ist</code>.</>
        ]
    },
    die: {
        title: "Tips Rahasia: DIE (Feminim)",
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon: "text-red-600",
        points: [
            <><strong>Orang perempuan & Profesi wanita:</strong> die Mutter, die Ärztin, die Lehrerin.</>,
            <><strong>Angka (saat jadi kata benda):</strong> die Eins, die Zwei, die Million.</>,
            <><strong>Nama Pohon dan Bunga:</strong> die Eiche, die Rose (mayoritas feminim).</>,
            <><strong>Sebagian besar nama Kapal & Pesawat:</strong> die Titanic, die Boeing.</>,
            <><strong>Akhiran Spesifik (Sangat Kuat!):</strong> <code>-e</code> (sangat banyak!), <code>-ung</code>, <code>-keit</code>, <code>-heit</code>, <code>-schaft</code>, <code>-ion</code>, <code>-tät</code>, <code>-ik</code>, <code>-ur</code>, <code>-enz</code>.</>
        ]
    },
    das: {
        title: "Tips Rahasia: DAS (Netral)",
        bg: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-800",
        icon: "text-yellow-600",
        points: [
            <><strong>Kata Pengecilan (Diminutive):</strong> <code>-chen</code>, <code>-lein</code>. (Contoh: das Mädchen, das Tischlein). <em>Semua yang berakhiran ini pasti DAS, meskipun artinya perempuan!</em></>,
            <><strong>Kata Kerja yang dibendakan:</strong> das Essen (makanan), das Lesen (kegiatan membaca).</>,
            <><strong>Warna (saat jadi kata benda):</strong> das Blau, das Rot.</>,
            <><strong>Logam dan Bahan Kimia:</strong> das Gold, das Silber.</>,
            <><strong>Akhiran Spesifik:</strong> <code>-ment</code>, <code>-um</code>, <code>-ma</code>, <code>-o</code>, <code>-tum</code>.</>
        ]
    }
};

// HELPER: Memisahkan Artikel dan Kata Dasar untuk Practice Mode
const extractArticle = (fullWord: string) => {
    const parts = fullWord.trim().split(" ");
    const article = parts[0]?.toLowerCase();
    if (["der", "die", "das"].includes(article)) {
        return { article, word: parts.slice(1).join(" ") };
    }
    return { article: "", word: fullWord };
};

const FlashcardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [refreshKey, setRefreshKey] = useState(0); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false); 
  
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileViewMenuRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIdx] = useState(0);
  const [flashcards, setFlashcards] = useState<Vocabulary[]>([]);
  const [allLevelNouns, setAllLevelNouns] = useState<Vocabulary[]>([]); // Menyimpan khusus Nomen buat Latihan
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [viewMode, setViewMode] = useState<"deck" | "list" | "practice">("deck");
  
  const [practiceCurrentIdx, setPracticeCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const { saveWord, isSaved, words, removeWord } = useDictionary();
  const { logActivity } = useActivityLog();
  const [knownWordsSet, setKnownWordsSet] = useState<Set<string>>(new Set());

  const savedWordsForLevel = words.filter(w => w.source === `Flashcard ${selectedLevel}`);

  const activeCategoryColor = CATEGORIES.find(c => c.id === selectedCategory)?.color || "bg-white text-slate-700 border-foreground";
  const activeModeData = VIEW_MODES.find(m => m.id === viewMode);
  const ActiveModeIcon = activeModeData?.icon || Layers;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
          (!mobileDropdownRef.current?.contains(target)) && 
          (!desktopDropdownRef.current?.contains(target)) &&
          (!mobileViewMenuRef.current?.contains(target))
      ) {
        setIsFilterOpen(false);
        setIsViewMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FETCH DATA (DIPERBARUI) ---
  useEffect(() => {
    const fetchVocabularies = async () => {
      setIsLoading(true);
      try {
        // AMBIL SEMUA kosakata di level ini tanpa difilter kategorinya di query
        const query = supabase
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

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const vocabList: Vocabulary[] = data.map((item: any) => ({
            german: item.german,
            indonesian: item.indonesian,
            example: item.example || "",
            category: item.category
          }));

          // 1. Simpan Nomen KHUSUS untuk Mode Latihan (Bebas dari Filter Kategori!)
          setAllLevelNouns(vocabList.filter(v => v.category === "noun"));

          // 2. Filter data untuk Mode Kartu (Sesuai kategori yang dipilih)
          let deckList = vocabList;
          if (selectedCategory !== "all") {
              if (selectedCategory === "adverb") {
                  deckList = vocabList.filter(v => ["adverb", "other"].includes(v.category));
              } else {
                  deckList = vocabList.filter(v => v.category === selectedCategory);
              }
          }

          setFlashcards(deckList);
          
          if (viewMode === "deck") {
            const savedIndex = loadLastCardPosition(selectedLevel);
            setCurrentIdx(selectedCategory === 'all' ? Math.min(savedIndex, Math.max(0, deckList.length - 1)) : 0);
          }
        }
        
        // Ambil data kata yang sudah dihafal
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
    if (viewMode !== "deck") return;
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

  // DATA UNTUK PRACTICE MODE (Diambil dari allLevelNouns, terbebas dari Filter Deck!)
  const practiceList = allLevelNouns.filter(f => knownWordsSet.has(f.german) && extractArticle(f.german).article !== "");
  const currentPracticeCard = practiceList[practiceCurrentIdx];
  const extracted = currentPracticeCard ? extractArticle(currentPracticeCard.german) : null;

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
                        {/* HANYA MUNCUL DI DECK: Mobile Filter Button */}
                        {viewMode === "deck" && (
                            <div className="relative z-50" ref={mobileDropdownRef}>
                                <button 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center border-2 rounded font-bold transition-all shadow-sm",
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
                        )}

                        {/* View Modes Dropdown Mobile */}
                        <div className="relative z-50" ref={mobileViewMenuRef}>
                            <button
                                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                                className={cn(
                                    "h-10 px-3 flex items-center justify-between gap-2 border-2 border-foreground rounded font-bold transition-all bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                                    isViewMenuOpen && "translate-y-[2px] shadow-none ring-2 ring-indigo-500"
                                )}
                            >
                                <ActiveModeIcon size={18} className="text-indigo-600 shrink-0" />
                                <span className="text-xs uppercase tracking-wider">{activeModeData?.label}</span>
                                <ChevronDown size={14} className={cn("transition-transform shrink-0", isViewMenuOpen ? "rotate-180" : "")} />
                            </button>

                            {isViewMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-[180px] bg-white border-2 border-foreground rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                                    {VIEW_MODES.map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => { 
                                                    setViewMode(mode.id as any); 
                                                    setIsViewMenuOpen(false);
                                                    if (mode.id === "practice") { setPracticeCurrentIdx(0); setSelectedAnswer(null); }
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors text-sm font-bold",
                                                    viewMode === mode.id ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon size={16} />
                                                    <span className="uppercase">{mode.label}</span>
                                                </div>
                                                {mode.id === 'list' && savedWordsForLevel.length > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border border-black leading-none">
                                                        {savedWordsForLevel.length}
                                                    </span>
                                                )}
                                                {viewMode === mode.id && mode.id !== 'list' && <Check size={14} />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
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
                {/* HANYA MUNCUL DI DECK: Desktop Filter Dropdown */}
                {viewMode === "deck" && (
                    <>
                        <div className="relative z-50" ref={desktopDropdownRef}>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={cn(
                                    "w-[200px] flex items-center justify-between gap-2 px-4 h-10 bg-white border-2 border-foreground rounded font-bold hover:bg-slate-50 transition-colors shadow-sm",
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
                        <div className="h-8 w-0.5 bg-foreground/20 mx-1"></div>
                    </>
                )}

                {/* Desktop View Accordion Buttons */}
                <div className="flex gap-2 h-10">
                    {VIEW_MODES.map((mode) => {
                        const isActive = viewMode === mode.id;
                        const Icon = mode.icon;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => { 
                                    setViewMode(mode.id as any); 
                                    if(mode.id === "practice") { setPracticeCurrentIdx(0); setSelectedAnswer(null); }
                                }}
                                title={isActive ? mode.label : undefined}
                                className={cn(
                                    "flex items-center border-2 border-foreground rounded font-bold transition-all duration-300 relative overflow-hidden",
                                    isActive 
                                        ? "w-12 justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-indigo-600" 
                                        : "px-4 justify-start bg-transparent opacity-60 hover:opacity-100 hover:bg-white/50"
                                )}
                            >
                                <Icon size={18} className="shrink-0" />
                                
                                <span className={cn(
                                    "uppercase text-sm whitespace-nowrap transition-all duration-300",
                                    isActive ? "w-0 opacity-0 hidden" : "w-auto opacity-100 ml-2"
                                )}>
                                    {mode.label}
                                </span>

                                {/* Badge */}
                                {mode.id === "list" && savedWordsForLevel.length > 0 && (
                                    <span className={cn(
                                        "bg-red-500 text-white flex items-center justify-center rounded-full border border-black font-bold",
                                        isActive ? "absolute top-1 right-1 w-3.5 h-3.5 text-[9px]" : "w-5 h-5 text-xs ml-2"
                                    )}>
                                        {savedWordsForLevel.length}
                                    </span>
                                )}
                            </button>
                        )
                    })}
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

        {/* 1. DECK MODE */}
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

        {/* 2. LIST MODE */}
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

        {/* 3. PRACTICE MODE (Latihan Der/Die/Das) */}
        {!isLoading && viewMode === "practice" && (
            <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-6 flex justify-between items-end border-b-2 border-slate-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-indigo-800">Latihan Artikel</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Uji ingatan artikel untuk Nomen yang sudah kamu hafal.</p>
                    </div>
                </div>

                {practiceList.length > 0 && currentPracticeCard && extracted ? (
                    <div className="space-y-6">
                        
                        {/* Status Progress */}
                        <div className="flex justify-end text-sm font-bold text-slate-400">
                            Kartu {practiceCurrentIdx + 1} / {practiceList.length}
                        </div>

                        {/* Card Kuis */}
                        <Card className="border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center py-12 px-4 md:px-10">
                            <p className="text-slate-400 font-bold uppercase tracking-widest mb-4">Pilih artikel yang tepat:</p>
                            
                            <h3 className="text-4xl md:text-5xl font-black mb-10 text-slate-800">
                                {extracted.word}
                            </h3>

                            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 max-w-md mx-auto">
                                {['der', 'die', 'das'].map((art) => {
                                    const isSelected = selectedAnswer === art;
                                    const isCorrectAnswer = art === extracted.article;
                                    const showResult = selectedAnswer !== null;

                                    let btnColor = "bg-white border-foreground text-foreground"; // Default
                                    
                                    // Custom Hover Colors (Sekarang Cantik! 🌈)
                                    let hoverColor = "";
                                    if (art === 'der') hoverColor = "hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700";
                                    if (art === 'die') hoverColor = "hover:bg-red-50 hover:border-red-500 hover:text-red-700";
                                    if (art === 'das') hoverColor = "hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-700";

                                    if (showResult) {
                                        if (isCorrectAnswer) {
                                            btnColor = "bg-green-500 text-white border-green-700 shadow-none translate-y-[2px]";
                                        } else if (isSelected && !isCorrectAnswer) {
                                            btnColor = "bg-red-500 text-white border-red-700 shadow-none translate-y-[2px]";
                                        } else {
                                            btnColor = "bg-slate-50 border-slate-200 text-slate-300 shadow-none";
                                        }
                                    }

                                    return (
                                        <button
                                            key={art}
                                            disabled={showResult}
                                            onClick={() => setSelectedAnswer(art)}
                                            className={cn(
                                                "flex-1 h-14 rounded-md text-xl font-bold border-2 transition-all uppercase flex items-center justify-center",
                                                btnColor,
                                                !showResult && hoverColor,
                                                !showResult && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                                            )}
                                        >
                                            {art}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Result Area & Super Tips Rahasia */}
                            {selectedAnswer && (
                                <div className="mt-10 animate-in slide-in-from-bottom-4 flex flex-col items-center w-full">
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-lg mb-6",
                                        selectedAnswer === extracted.article ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                                    )}>
                                        {selectedAnswer === extracted.article ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        {selectedAnswer === extracted.article 
                                            ? "Tepat Sekali!" 
                                            : <span>Kurang Tepat, yang benar: <strong className="uppercase underline underline-offset-2">{extracted.article}</strong></span>
                                        }
                                    </div>
                                    
                                    <Button 
                                        size="lg" 
                                        className="w-full sm:w-auto h-14 font-bold text-lg mb-4"
                                        onClick={() => {
                                            setSelectedAnswer(null);
                                            if (practiceCurrentIdx < practiceList.length - 1) {
                                                setPracticeCurrentIdx(prev => prev + 1);
                                            } else {
                                                setPracticeCurrentIdx(0); // Ulangi dari awal
                                                toast({ title: "Latihan selesai! Mengulang dari awal 🔄" });
                                            }
                                        }}
                                    >
                                        Lanjut ke Kata Berikutnya <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>

                                    {/* MUNCULKAN TIPS SPESIFIK SESUAI JAWABAN BENAR */}
                                    <div className={cn(
                                        "border-2 shadow-sm mt-6 w-full text-left overflow-hidden rounded-xl animate-in zoom-in-95 duration-300", 
                                        TIPS_DATA[extracted.article as keyof typeof TIPS_DATA].bg
                                    )}>
                                        <div className="bg-white/50 border-b border-inherit px-5 py-3 flex items-center gap-3 font-black text-lg">
                                            <Lightbulb className={TIPS_DATA[extracted.article as keyof typeof TIPS_DATA].icon} size={24} />
                                            <span className={TIPS_DATA[extracted.article as keyof typeof TIPS_DATA].text}>
                                                {TIPS_DATA[extracted.article as keyof typeof TIPS_DATA].title}
                                            </span>
                                        </div>
                                        <div className="p-5 md:p-6 text-slate-700">
                                            <ul className="space-y-3 font-medium text-sm md:text-base list-disc pl-5">
                                                {TIPS_DATA[extracted.article as keyof typeof TIPS_DATA].points.map((pt, i) => (
                                                    <li key={i}>{pt}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-xl">
                        <Brain className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl text-slate-700 font-black mb-2">Belum Ada Bahan Latihan</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">
                            Kamu belum memiliki Kata Benda (Nomen) yang ditandai "Sudah Hafal" di Level {selectedLevel}.
                        </p>
                        <Button 
                            className="mt-6 font-bold" 
                            onClick={() => {
                                setViewMode("deck"); 
                                setSelectedCategory("noun");
                            }}
                        >
                            <Layers className="w-4 h-4 mr-2" />
                            Mulai Hafalkan Nomen
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