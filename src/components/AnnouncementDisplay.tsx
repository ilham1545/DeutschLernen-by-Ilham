import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Megaphone, Calendar, ArrowRight, Bell, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  type: 'popup' | 'marquee';
  direction: 'left' | 'right';
  content: any[]; 
  is_active: boolean;
  created_at: string;
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
        .eq("is_active", true)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setMarquees(data.filter((a) => a.type === "marquee"));
        
        // Ambil 1 popup terbaru
        const foundPopup = data.find((a) => a.type === "popup");
        if (foundPopup) {
            setPopup(foundPopup);
            setIsPopupOpen(true);
        }
      }
    };
    fetchAnnouncements();
  }, []);

  const handleClosePopup = () => {
      setIsPopupOpen(false);
  };

  // Helper render rich text
  const renderContent = (content: any[]) => {
      if (!Array.isArray(content)) return null;
      return content.map((block: any, idx: number) => {
          if (block.type === 'text') return <div key={idx} className="mb-3 text-sm md:text-base leading-relaxed text-slate-600 font-medium" dangerouslySetInnerHTML={{ __html: block.content }} />;
          if (block.type === 'list') return <ul key={idx} className="space-y-2 mb-4 pl-1">{block.items?.map((it: string, i: number) => <li key={i} className="flex gap-3 text-sm text-slate-600 items-start"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span><span>{it}</span></li>)}</ul>;
          if (block.type === 'image') return <div key={idx} className="relative rounded-2xl overflow-hidden my-4 border border-slate-100"><img src={block.src} className="w-full object-cover" alt="Announcement" /></div>;
          if (block.type === 'table') return <div key={idx} className="overflow-hidden my-4 border border-slate-200 rounded-xl"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-700 font-bold"><tr>{block.headers?.map((h:any,i:any)=><th key={i} className="p-3 border-b border-slate-200">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{block.rows?.map((r:any,i:any)=><tr key={i} className="hover:bg-slate-50/50">{r.map((c:any,j:any)=><td key={j} className="p-3 text-slate-600">{c}</td>)}</tr>)}</tbody></table></div>;
      });
  };

  return (
    <>
      {/* 1. MARQUEE / RUNNING TEXT (SEPARATED MOBILE & DESKTOP) */}
      {marquees.length > 0 && (
        <div className="relative w-full z-60 bg-white border-b border-slate-100 overflow-hidden py-4 flex items-center">
           
           {/* === VERSI MOBILE (Sederhana, Cepat, Anti-Potong) === */}
           <div className="md:hidden flex w-max animate-marquee-mobile hover:[animation-play-state:paused] items-center">
             {/* KITA RENDER 2 KALI BIAR LOOPING */}
             {[0, 1].map((i) => (
                <div key={`m-${i}`} className="flex shrink-0 items-center">
                    {marquees.map((item, idx) => (
                        <div key={`m-${i}-${idx}`} className="flex items-center gap-2 mx-4 pl-3 border-l-4 border-indigo-500">
                            <span className="font-black text-[10px] uppercase tracking-widest text-indigo-600 whitespace-nowrap">
                                {item.title}
                            </span>
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                                {Array.isArray(item.content) 
                                    ? item.content.find(c => c.type === 'text')?.content?.replace(/<[^>]+>/g, '') 
                                    : ""}
                            </span>
                        </div>
                    ))}
                </div>
             ))}
           </div>

           {/* === VERSI DESKTOP (Rapi, Elegan, Lebih Lambat) === */}
           <div className="hidden md:flex w-max animate-marquee-desktop hover:[animation-play-state:paused] items-center">
             {[0, 1].map((i) => (
                <div key={`d-${i}`} className="flex shrink-0 items-center">
                    {marquees.map((item, idx) => (
                        <div key={`d-${i}-${idx}`} className="flex items-center gap-3 mx-8 pl-4 border-l-4 border-indigo-500">
                            <span className="font-black text-xs uppercase tracking-widest text-indigo-600 whitespace-nowrap">
                                {item.title}
                            </span>
                            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                                {Array.isArray(item.content) 
                                    ? item.content.find(c => c.type === 'text')?.content?.replace(/<[^>]+>/g, '') 
                                    : ""}
                            </span>
                        </div>
                    ))}
                </div>
             ))}
           </div>

           {/* STYLE MANUAL (DIPISAH JUGA) */}
           <style>{`
             @keyframes marquee-scroll {
               0% { transform: translateX(0); }
               100% { transform: translateX(-50%); }
             }
             
             /* Animasi Mobile: Lebih Cepat (20s) */
             .animate-marquee-mobile {
               animation: marquee-scroll 20s linear infinite;
             }

             /* Animasi Desktop: Standar (30s) */
             .animate-marquee-desktop {
               animation: marquee-scroll 30s linear infinite;
             }
           `}</style>
        </div>
      )}

      {/* 2. POPUP MODAL */}
      {popup && (
        <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          {/* PERBAIKAN: Menambahkan '[&>button]:hidden' pada className DialogContent 
              untuk memaksa sembunyikan tombol close bawaan shadcn/radix. 
              Kita pakai tombol custom di bawahnya agar desain lebih konsisten.
          */}
          <DialogContent className="max-w-[90vw] md:max-w-md p-0 overflow-hidden border border-slate-200 shadow-none rounded-[2.5rem] bg-white z-[99999] outline-none [&>button]:hidden">
             
             {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-indigo-50 to-white z-0"></div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl z-0"></div>
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl z-0"></div>

             {/* Main Container */}
             <div className="relative z-10 flex flex-col h-full">
                 
                 {/* Close Button (Custom) */}
                 <button onClick={handleClosePopup} className="absolute top-5 right-5 p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-500 rounded-full transition-all active:scale-95 z-50">
                    <X className="w-5 h-5"/>
                 </button>

                 {/* Header Icon & Title */}
                 <div className="px-8 pt-10 pb-2 flex flex-col items-center text-center">
                     <div className="relative mb-5">
                         <div className="h-20 w-20 bg-indigo-600 rounded-3xl rotate-3 absolute inset-0 opacity-20"></div>
                         <div className="h-20 w-20 bg-indigo-600 rounded-3xl -rotate-3 absolute inset-0 opacity-20"></div>
                         <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center relative shadow-none ring-4 ring-white">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                         </div>
                     </div>

                     <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                         {popup.title}
                     </h2>
                     
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                        <Calendar className="w-3 h-3 text-slate-400"/>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {new Date(popup.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                     </div>
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 px-8 py-4 overflow-y-auto max-h-[40vh] scrollbar-thin scrollbar-thumb-slate-200">
                    {renderContent(popup.content)}
                 </div>

                 {/* Footer Button */}
                 <div className="p-8 pt-4">
                     <Button 
                        onClick={handleClosePopup} 
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-2xl shadow-none transition-all active:scale-[0.98] group flex items-center justify-center gap-2"
                     >
                        Mengerti, Tutup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                     </Button>
                 </div>
             </div>

          </DialogContent>
        </Dialog>
      )}
    </>
  );
};