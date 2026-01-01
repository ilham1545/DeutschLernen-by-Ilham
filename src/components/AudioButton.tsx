import { Volume2 } from "lucide-react";
import { useState, useEffect } from "react";

// Kita tambahkan prop 'lang' opsional
interface AudioButtonProps {
  text: string;
  lang?: "de-DE" | "id-ID" | "en-US"; // Default nanti de-DE
  className?: string;
}

const AudioButton = ({ text, lang = "de-DE", className }: AudioButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.speechSynthesis) {
      console.warn("Browser tidak support TTS");
      return;
    }

    window.speechSynthesis.cancel();

    // 1. BERSIHKAN TEKS
    let cleanText = text;
    cleanText = cleanText.replace(/[*_#\[\]]/g, ""); 
    cleanText = cleanText.replace(/\s*\(.*?\)\s*/g, ""); 
    cleanText = cleanText.replace(/['"]/g, "");
    cleanText = cleanText.trim();

    if (!cleanText) return;

    // 2. LOGIKA CARI SUARA SESUAI BAHASA
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (lang === "id-ID") {
      // --- LOGIKA INDONESIA ---
      // Cari suara Google Bahasa Indonesia dulu (paling natural), baru fallback ke apapun yang 'id'
      selectedVoice = 
        voices.find(v => v.lang === "id-ID" && v.name.includes("Google")) || 
        voices.find(v => v.lang.includes("id-ID") || v.lang.includes("ind"));
        
    } else if (lang === "en-US") {
      // --- LOGIKA INGGRIS ---
      selectedVoice = 
        voices.find(v => v.lang === "en-US" && v.name.includes("Google")) || 
        voices.find(v => v.lang.startsWith("en-"));

    } else {
      // --- LOGIKA JERMAN (DEFAULT) ---
      selectedVoice = 
        voices.find(v => v.lang === "de-DE" && v.name.includes("Google")) || 
        voices.find(v => v.lang === "de-DE" && v.name.includes("Microsoft")) || 
        voices.find(v => v.lang.startsWith("de"));
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set Bahasa & Suara
    utterance.lang = lang; 
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Tweak Kecepatan (Indo biasanya perlu agak lambat biar gak ngebut kayak kereta)
    utterance.rate = lang === "id-ID" ? 0.85 : 0.9; 
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={playAudio}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-all shrink-0 ${
        isSpeaking 
          ? "bg-green-100 text-green-600 scale-110 ring-2 ring-green-200" 
          : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 active:scale-95"
      } ${className}`}
      title={`Dengar (${lang === "id-ID" ? "Indonesia" : lang === "en-US" ? "Inggris" : "Jerman"})`}
    >
      <Volume2 size={18} className={isSpeaking ? "fill-current animate-pulse" : ""} />
    </button>
  );
};

export default AudioButton;