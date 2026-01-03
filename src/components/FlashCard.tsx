import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import { Vocabulary } from "@/data/lessons";
import { cn } from "@/lib/utils";

// HELPER WARNA KATEGORI (Desain Chip Lebih Rapi & Soft)
const getCategoryBadge = (cat?: string) => {
  const baseStyle = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm";
  
  switch (cat) {
    case 'noun': return <span className={`${baseStyle} bg-blue-50 text-blue-700 border-blue-200`}>Nomen</span>;
    case 'verb': return <span className={`${baseStyle} bg-red-50 text-red-700 border-red-200`}>Verben</span>;
    case 'adjective': return <span className={`${baseStyle} bg-yellow-50 text-yellow-700 border-yellow-200`}>Adjektiv</span>;
    case 'phrase': return <span className={`${baseStyle} bg-purple-50 text-purple-700 border-purple-200`}>Frasa</span>;
    case 'adverb': return <span className={`${baseStyle} bg-emerald-50 text-emerald-700 border-emerald-200`}>Adverb</span>;
    default: return <span className={`${baseStyle} bg-slate-50 text-slate-600 border-slate-200`}>Lainnya</span>;
  }
};

interface FlashCardProps {
  vocabulary: Vocabulary;
  index: number;
  total: number;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

const FlashCard = ({ vocabulary, index, total, isBookmarked, onBookmark }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(vocabulary.german);
    utterance.lang = "de-DE";
    window.speechSynthesis.speak(utterance);
  };

  const playExampleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vocabulary.example) {
        const utterance = new SpeechSynthesisUtterance(vocabulary.example);
        utterance.lang = "de-DE";
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.();
  };

  return (
    <div
      className="perspective-1000 h-[450px] w-full max-w-xl mx-auto cursor-pointer group select-none"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "relative w-full h-full transition-all duration-500 transform-style-3d",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* --- SISI DEPAN --- */}
        <div className="absolute inset-0 w-full h-full backface-hidden z-10">
          <Card className="w-full h-full border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            
            {/* 1. POSISI BARU BADGE KATEGORI (POJOK KIRI ATAS) */}
            <div className="absolute top-6 left-6 z-20">
                {getCategoryBadge(vocabulary.category)}
            </div>

            {/* Tombol Kanan Atas */}
            <div className={cn(
              "absolute top-4 right-4 flex gap-2 z-20 transition-opacity duration-200",
              isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full hover:bg-slate-100 w-10 h-10" 
                onClick={playAudio}
              >
                <Volume2 className="w-6 h-6 text-blue-600" />
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "rounded-full hover:bg-yellow-50 w-10 h-10 transition-colors", 
                  isBookmarked ? "text-yellow-500 hover:bg-red-50 hover:text-red-500" : "text-slate-300 hover:text-yellow-500"
                )} 
                onClick={handleBookmarkClick}
              >
                {isBookmarked ? <BookmarkCheck className="w-6 h-6 fill-current" /> : <Bookmark className="w-6 h-6" />}
              </Button>
            </div>

            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Bahasa Jerman
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-center text-foreground break-words max-w-full relative z-10">
              {vocabulary.german}
            </h2>
            <p className="absolute bottom-6 text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
              Ketuk untuk membalik
            </p>
          </Card>
        </div>

        {/* --- SISI BELAKANG --- */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 z-10">
          <Card className="w-full h-full border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-amber-50 text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Sparkles className="absolute -top-6 -right-6 h-32 w-32 text-amber-200/50 rotate-12 pointer-events-none" />

            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 border-b border-amber-700/30 pb-1">
                Artinya
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-center break-words leading-tight mb-4 text-foreground">
                {vocabulary.indonesian}
                </h2>
            </div>

            <div className="w-full border-t-2 border-dashed border-amber-800/30 my-2 relative z-10"></div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                    Contoh Penggunaan
                </span>
                
                {vocabulary.example ? (
                    <div className="text-center group-example relative cursor-pointer px-4 py-3 rounded-xl hover:bg-amber-100/80 transition-colors duration-300 border-2 border-transparent hover:border-amber-200" onClick={playExampleAudio}>
                        <p className="text-lg italic font-medium text-amber-950 leading-relaxed">
                            "{vocabulary.example}"
                        </p>
                        <Volume2 size={14} className="inline-block mt-2 text-amber-700/50" />
                    </div>
                ) : (
                    <p className="text-sm text-amber-700/60 italic">Tidak ada contoh kalimat.</p>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;