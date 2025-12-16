import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { 
  BookOpen, Home, BarChart3, Menu, X, ChevronDown, Library, 
  Map as MapIcon, 
  ClipboardCheck, PenTool, Book, Trophy, CreditCard, 
  User, LogOut, LayoutDashboard 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate("/login");
  };

  const levels = ["A1", "A2", "B1", "B2"];

  if (location.pathname.includes("/simulation")) {
    return null;
  }

  return (
    <header className="border-b-4 border-foreground bg-background sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight shrink-0">
            <span className="bg-foreground text-background px-2 py-1">DEUTSCH</span>
            <span>LERNEN</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center gap-2 lg:gap-4">
            
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 px-3 py-2 font-medium transition-all border-2 rounded-md",
                location.pathname === "/"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-transparent hover:border-foreground"
              )}
            >
              <Home size={18} />
              <span className="hidden lg:inline">Home</span>
            </Link>

            {/* 2. DROPDOWN MATERI */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 font-medium transition-all border-2 border-transparent hover:border-foreground rounded-md outline-none focus:border-foreground data-[state=open]:border-foreground group">
                <Library size={18} />
                <span>Materi</span>
                <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none mt-2">
                {levels.map((level) => (
                  <DropdownMenuItem key={`mat-${level}`} asChild className="focus:bg-accent focus:text-foreground cursor-pointer">
                    <Link to={`/material/${level}`} className="w-full font-bold py-2">
                      Materi {level}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. DROPDOWN WORTSCHATZ */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 font-medium transition-all border-2 border-transparent hover:border-foreground rounded-md outline-none focus:border-foreground data-[state=open]:border-foreground group">
                <BookOpen size={18} />
                <span>Wortschatz</span>
                <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none mt-2">
                {levels.map((level) => (
                  <DropdownMenuItem key={`voc-${level}`} asChild className="focus:bg-accent focus:text-foreground cursor-pointer">
                    <Link to={`/level/${level}`} className="w-full font-bold py-2">
                      Kosakata {level}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 4. DROPDOWN UJIAN */}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "flex items-center gap-2 px-3 py-2 font-medium transition-all border-2 border-transparent hover:border-foreground rounded-md outline-none focus:border-foreground data-[state=open]:border-foreground group",
                location.pathname.includes("EXAM") && "bg-foreground text-background border-foreground"
              )}>
                <ClipboardCheck size={18} />
                <span>Ujian</span>
                <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none mt-2">
                {levels.map((level) => (
                  <DropdownMenuItem key={`exam-${level}`} asChild className="focus:bg-accent focus:text-foreground cursor-pointer">
                    <Link to={`/material/EXAM_${level}`} className="w-full font-bold py-2">
                      Simulasi {level}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* MENU BERIKUTNYA HANYA UNTUK USER LOGIN (DESKTOP) */}
            {user && (
              <>
                {/* 5. DROPDOWN LAINNYA */}
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(
                    "flex items-center gap-2 px-3 py-2 font-medium transition-all border-2 border-transparent hover:border-foreground rounded-md outline-none focus:border-foreground data-[state=open]:border-foreground group",
                    (location.pathname === "/flashcard" || location.pathname === "/dictionary" || location.pathname.includes("/quiz")) 
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-transparent hover:border-foreground"
                  )}>
                    <PenTool size={18} />
                    <span>Lainnya</span>
                    <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none mt-2">
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-foreground cursor-pointer">
                      <Link to="/flashcard" className="w-full font-bold py-2 flex items-center gap-2">
                        <CreditCard size={16} /> Flashcard
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-foreground cursor-pointer">
                      <Link to="/dictionary" className="w-full font-bold py-2 flex items-center gap-2">
                        <Book size={16} /> Kamus Saya
                      </Link>
                    </DropdownMenuItem>

                    <div className="h-[2px] bg-foreground/20 w-full my-1"></div>
                    
                    <div className="px-2 py-1 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Evaluasi Quiz
                    </div>
                    {levels.map((level) => (
                      <DropdownMenuItem key={`quiz-${level}`} asChild className="focus:bg-accent focus:text-foreground cursor-pointer">
                        <Link to={`/quiz/${level}`} className="w-full font-bold py-2 flex justify-between items-center pl-4">
                          Quiz {level}
                          <Trophy size={14} className="text-yellow-600" />
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 6. MEIN WEG */}
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(
                    "flex items-center gap-2 px-3 py-2 font-medium transition-all border-2 rounded-md outline-none focus:border-foreground data-[state=open]:border-foreground group",
                    location.pathname.includes("/progress") || location.pathname.includes("/planner") || location.pathname.includes("/mein-weg")
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-transparent hover:border-foreground"
                  )}>
                    <MapIcon size={18} />
                    <span className="hidden lg:inline">Mein Weg</span>
                    <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none mt-2">
                    
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-foreground cursor-pointer p-0">
                      <Link to="/mein-weg" className="w-full font-bold py-3 px-2 flex items-center gap-2">
                        <MapIcon size={18} /> Program & Progress
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-foreground cursor-pointer p-0">
                      <Link to="/progress" className="w-full font-bold py-3 px-2 flex items-center gap-2">
                        <BarChart3 size={18} /> Statistik
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-[2px] bg-foreground w-full my-0"></div>
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-foreground cursor-pointer p-0">
                      <Link to="/planner" className="w-full font-bold py-3 px-2 flex items-center gap-2">
                        <MapIcon size={18} /> Study Planner
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

          </nav>

          <div className="flex items-center gap-2">
            
            {/* USER LOGIN / PROFILE (DESKTOP) */}
            <div className="hidden xl:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-foreground p-0 hover:bg-slate-100 transition-transform active:scale-95">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback className="font-bold bg-yellow-400 text-black">
                           {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2">
                    
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{user.user_metadata.full_name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="cursor-pointer font-bold">
                        <Link to="/dashboard" className="flex items-center w-full">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard Profile
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem className="font-bold text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" /> Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm" className="font-bold">
                    <Link to="/login">Masuk</Link>
                  </Button>
                  <Button asChild className="font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] transition-all">
                    <Link to="/register">Daftar</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 border-2 border-foreground rounded-md active:bg-accent active:text-accent-foreground transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>

        {/* MOBILE NAVIGATION CONTENT */}
        {mobileMenuOpen && (
          <nav className="absolute top-16 left-4 right-4 mt-2 xl:hidden py-4 border-2 border-foreground bg-background rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[70vh] z-50 animate-in slide-in-from-top-5 fade-in-0">
            <div className="flex flex-col gap-4 pb-8">
              
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 font-bold border-2 border-transparent active:bg-accent mx-2 rounded-md transition-colors"
              >
                <Home size={20} /> Home
              </Link>

              {/* Group Materi (TAMPIL UNTUK SEMUA) */}
              <div className="px-2">
                <div className="px-2 pb-2 text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Library size={14} /> Materi Pelajaran
                </div>
                <div className="grid grid-cols-4 gap-2 px-2">
                  {levels.map((level) => (
                    <Link
                      key={`mob-mat-${level}`}
                      to={`/material/${level}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 border-2 border-foreground font-bold bg-background text-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all rounded-md"
                    >
                      {level}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Group Ujian (TAMPIL UNTUK SEMUA) */}
              <div className="px-2 mt-2">
                <div className="px-2 pb-2 text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <ClipboardCheck size={14} /> Simulasi Ujian
                </div>
                <div className="grid grid-cols-2 gap-2 px-2">
                  {levels.map((level) => (
                    <Link
                      key={`mob-exam-${level}`}
                      to={`/material/EXAM_${level}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-3 border-2 border-foreground font-bold bg-red-50 text-red-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all rounded-md"
                    >
                      <span>Simulasi {level}</span>
                      <ChevronDown size={14} className="-rotate-90" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Group Wortschatz (TAMPIL UNTUK SEMUA) */}
              <div className="px-2 mt-2">
                <div className="px-2 pb-2 text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={14} /> Wortschatz
                </div>
                <div className="grid grid-cols-4 gap-2 px-2">
                  {levels.map((level) => (
                    <Link
                      key={`mob-voc-${level}`}
                      to={`/level/${level}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 border-2 border-foreground font-bold text-foreground bg-background active:bg-foreground active:text-background transition-colors rounded-md"
                    >
                      {level}
                    </Link>
                  ))}
                </div>
              </div>

              {/* MENU RAHASIA: HANYA MUNCUL JIKA USER LOGIN */}
              {user && (
                <>
                  <div className="border-t-2 border-dashed border-foreground/30 my-2 mx-4"></div>

                  {/* Group Latihan */}
                  <div className="px-2 mt-2">
                    <div className="px-2 pb-2 text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <PenTool size={14} /> Alat & Latihan
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      <Link
                        to="/flashcard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 font-bold border-2 border-foreground bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all rounded-md"
                      >
                        <CreditCard size={20} /> Flashcard
                      </Link>
                      <Link
                        to="/dictionary"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 font-bold border-2 border-foreground bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all rounded-md"
                      >
                        <Book size={20} /> Kamus Saya
                      </Link>
                      
                      {/* Quiz Grid */}
                      <div className="grid grid-cols-4 gap-2 mt-1">
                        {levels.map((level) => (
                          <Link
                            key={`mob-quiz-${level}`}
                            to={`/quiz/${level}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-center py-2 border-2 border-foreground font-bold bg-yellow-50 text-foreground active:bg-yellow-100 transition-colors rounded-md text-xs"
                          >
                            Quiz {level}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Group Mein Weg */}
                  <div className="px-2 mt-2">
                      <div className="px-2 pb-2 text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <MapIcon size={14} /> Mein Weg
                    </div>
                    
                    <div className="px-2 mb-2">
                        <Link
                        to="/mein-weg"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full text-center py-3 border-2 border-foreground font-bold bg-blue-600 text-white active:bg-blue-700 transition-colors rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                        <MapIcon size={18} /> Program & Progress
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-2">
                      <Link
                        to="/progress"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-3 border-2 border-foreground font-bold bg-yellow-100 text-foreground active:bg-yellow-200 transition-colors rounded-md"
                      >
                        Statistik
                      </Link>
                      <Link
                        to="/planner"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-3 border-2 border-foreground font-bold bg-blue-100 text-foreground active:bg-blue-200 transition-colors rounded-md"
                      >
                        Planner
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* LOGOUT & DASHBOARD LINK DI MOBILE (BAGIAN BAWAH) */}
              {user ? (
                <div className="px-4 mt-4 flex flex-col gap-3">
                  
                  {/* TOMBOL DASHBOARD PROFILE */}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 px-4 py-3 font-bold border-2 border-foreground bg-white text-foreground hover:bg-slate-100 active:bg-slate-200 rounded-md transition-colors"
                  >
                    <LayoutDashboard size={20} /> Dashboard Profile
                  </Link>

                  <Button variant="destructive" className="w-full font-bold border-2 border-black" onClick={handleSignOut}>
                    Keluar
                  </Button>
                </div>
              ) : (
                <div className="px-4 mt-4">
                  {/* TOMBOL MASUK MOBILE */}
                  <Button asChild className="w-full font-bold border-2 border-black">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Masuk
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;