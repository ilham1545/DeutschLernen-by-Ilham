import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Megaphone, AlertTriangle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  type: 'popup' | 'marquee';
  direction: 'left' | 'right';
  content: any[]; // JSON Block content
  is_active: boolean;
};

export const AnnouncementDisplay = () => {
  const [marquees, setMarquees] = useState<Announcement[]>([]);
  const [popup, setPopup] = useState<Announcement | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true);

      if (data) {
        // Pisahkan mana yang marquee, mana yang popup
        setMarquees(data.filter((a) => a.type === "marquee"));
        
        // Ambil satu popup terbaru saja untuk ditampilkan
        const foundPopup = data.find((a) => a.type === "popup");
        if (foundPopup) {
            // Cek localStorage biar gak muncul terus-terusan setiap refresh (Opsional)
            // const hasSeen = localStorage.getItem(`seen_popup_${foundPopup.id}`);
            // if (!hasSeen) {
                setPopup(foundPopup);
                setIsPopupOpen(true);
            // }
        }
      }
    };

    fetchAnnouncements();
  }, []);

  const handleClosePopup = () => {
      setIsPopupOpen(false);
      // Simpan ke localStorage jika ingin popup cuma muncul sekali per user
      if (popup) {
        // localStorage.setItem(`seen_popup_${popup.id}`, "true"); 
      }
  };

  // Helper untuk render konten JSON (Rich Text)
  const renderContent = (content: any[]) => {
      if (!Array.isArray(content)) return null;
      return content.map((block: any, idx: number) => {
          if (block.type === 'text') {
              return <div key={idx} className="mb-2 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />;
          }
          if (block.type === 'list') {
              return (
                  <ul key={idx} className="list-disc pl-5 mb-2 space-y-1 text-sm">
                      {block.items?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
              );
          }
          if (block.type === 'image') {
              return <img key={idx} src={block.src} alt={block.alt || 'Announcement Image'} className="w-full rounded-lg my-2 border" />;
          }
          if (block.type === 'table') {
              return (
                  <div key={idx} className="overflow-x-auto my-2 border rounded-lg">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-100 text-xs uppercase">
                              <tr>{block.headers?.map((h: string, i: number) => <th key={i} className="px-3 py-2">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                              {block.rows?.map((row: string[], i: number) => (
                                  <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                                      {row.map((cell, j) => <td key={j} className="px-3 py-2 border-r last:border-0">{cell}</td>)}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              );
          }
          return null;
      });
  };

  return (
    <>
      {/* 1. MARQUEE / RUNNING TEXT */}
      {marquees.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs md:text-sm py-2 relative overflow-hidden shadow-md z-50">
           {marquees.map((item) => (
               <div key={item.id} className="flex gap-4 items-center">
                   <div className={cn(
                       "whitespace-nowrap flex gap-8 items-center w-full absolute top-1/2 -translate-y-1/2",
                       item.direction === 'right' ? "animate-marquee-reverse" : "animate-marquee"
                   )}>
                       {/* Duplikat konten biar loopingnya halus */}
                       {[...Array(10)].map((_, i) => (
                           <span key={i} className="flex items-center gap-2 mx-4">
                               <Megaphone className="w-4 h-4 fill-white animate-pulse" /> 
                               <span className="font-bold">{item.title}:</span> 
                               {/* Ambil konten text pertama aja untuk marquee */}
                               <span dangerouslySetInnerHTML={{ __html: Array.isArray(item.content) ? item.content.find(c => c.type === 'text')?.content : "" }}></span>
                           </span>
                       ))}
                   </div>
               </div>
           ))}
        </div>
      )}

      {/* 2. POPUP MODAL */}
      {popup && (
        <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          <DialogContent className="max-w-md md:max-w-lg rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
                 <Button variant="ghost" size="icon" onClick={handleClosePopup} className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full"><X className="w-5 h-5"/></Button>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Info className="w-6 h-6 text-white"/></div>
                    <DialogTitle className="text-xl font-bold">{popup.title}</DialogTitle>
                 </div>
                 <DialogDescription className="text-blue-100 hidden">Announcement details</DialogDescription>
             </div>
             
             <div className="p-6 max-h-[60vh] overflow-y-auto bg-white text-slate-800">
                {renderContent(popup.content)}
             </div>

             <div className="p-4 bg-slate-50 border-t flex justify-end">
                 <Button onClick={handleClosePopup} className="bg-slate-900 text-white hover:bg-slate-800">Saya Mengerti</Button>
             </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CSS untuk Animasi Marquee (Running Text) */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 20s linear infinite;
        }
      `}</style>
    </>
  );
};