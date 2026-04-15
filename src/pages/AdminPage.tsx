import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, UploadCloud, FileJson, LogOut, Plus, Trash2, Edit2, 
  Layers, BookOpen, Crown, BookText, FileCode, LayoutDashboard, Database,
  Menu, X, Home, ArrowLeft, UserCircle, HelpCircle, Save, AlignLeft, List, Grid3X3, Image as ImageIcon, GraduationCap,
  ArrowUp, ArrowDown, Link as LinkIcon, RotateCcw, Search, AlertTriangle, Globe, MessageCircle, PenTool, CheckCircle2, Lightbulb, Megaphone, BellRing, MoveHorizontal,
  Bold, Italic, Underline, Link2, ChevronRight, MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// --- TIPE DATA ---
type Level = { id: string; title: string; description: string };
type Lesson = { id: string; title: string; slug: string; level_id: string; order_index: number };
type Vocab = { id: string; german: string; indonesian: string; example: string; lesson_id: string; category?: string }; 
type DialogLineDB = { id?: string; speaker: string; german: string; indonesian?: string; order_index: number };
type DialogDB = { id: string; title: string; lesson_id: string; dialog_lines?: DialogLineDB[] }; 
type Exercise = { id: string; question: string; options: string[]; correct_answer: number; lesson_id: string };
type CourseMaterialDB = { id: string; title: string; section_id: string; level_id: string; order_index: number; content: any; resources?: any[]; tips?: string[]; status?: string };
type QuizHeader = { id: string; level: string; title: string };
type QuizQuestionDB = { id: string; quiz_id: string; question: string; type: string; options: any; correct_answer: any; explanation: string; order_index: number };
type ProgramDB = {
  id: string; title: string; category: string; description: string; 
  salary: string; duration: string; source: string; what_you_learn: string[];
};
type AnnouncementDB = {
    id: string; title: string; type: 'popup' | 'marquee'; direction: 'left' | 'right';
    content: any; is_active: boolean; created_at: string;
};

const defaultCategoryLabels: Record<string, string> = {
  general: "Program Umum",
  health: "Kesehatan (Gesundheit)",
  tech: "Teknik & IT",
  business: "Bisnis & Admin",
  gastro: "Hotel & Restoran",
  craft: "Handwerk & Konstruksi",
  logistics: "Logistik & Transport",
  science: "Sains & Lab",
  social: "Sosial & Lingkungan",
  media: "Media & Entertaiment",
  lainnya: "Lainnya"
};

const AdminPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "vocab" | "material" | "quiz" | "program" | "import" | "announcement">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fullName, setFullName] = useState("Admin");

  const [levels, setLevels] = useState<Level[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [dialogs, setDialogs] = useState<DialogDB[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [materials, setMaterials] = useState<CourseMaterialDB[]>([]);
  const [quizzes, setQuizzes] = useState<QuizHeader[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionDB[]>([]);
  const [programs, setPrograms] = useState<ProgramDB[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementDB[]>([]);
  
  const [categoryList, setCategoryList] = useState<string[]>(Object.keys(defaultCategoryLabels));
  const [stats, setStats] = useState({ levels: 0, lessons: 0, vocabs: 0, materials: 0, questions: 0, programs: 0, announcements: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [programFilter, setProgramFilter] = useState<"all" | "general" | "ausbildung">("all");
  const [vocabSearchTerm, setVocabSearchTerm] = useState(""); 
  const [activeVocabTab, setActiveVocabTab] = useState<"vocab" | "dialog" | "exercise">("vocab");

  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionDB | null>(null);
  const [quizQuestionText, setQuizQuestionText] = useState("");
  const [quizType, setQuizType] = useState<"multiple-choice" | "fill-blank" | "reorder">("multiple-choice");
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizOptions, setQuizOptions] = useState<string[]>(["", "", ""]);
  const [quizCorrectOption, setQuizCorrectOption] = useState("");
  const [quizBlankAnswer, setQuizBlankAnswer] = useState("");
  const [quizReorderSentence, setQuizReorderSentence] = useState("");

  const [importType, setImportType] = useState<"vocab" | "material" | "quiz" | "program">("vocab");
  const [jsonInput, setJsonInput] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false); 
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false); 
  const [programDialogOpen, setProgramDialogOpen] = useState(false); 
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); 
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: string} | null>(null); 
  const [formType, setFormType] = useState<"level" | "lesson" | "vocab" | "dialog" | "exercise" | "announcement">("vocab");
  
  const [formData, setFormData] = useState({
    id: "", title: "", description: "", slug: "", order_index: 0,
    german: "", indonesian: "", example: "", category: "noun",
    explanation: "", examples: "", 
    dialog_lines: [] as { speaker: string, german: string, indonesian: string }[],
    question: "", options: ["", "", "", ""], correct_answer_idx: "0"
  });

  const [materialForm, setMaterialForm] = useState({
    id: "", title: "", section_id: "", level_id: "A1", order_index: 0,
    content: [] as any[],
    resources: [] as { title: string, url: string, type: string }[],
    tips: "",
    status: "draft"
  });

  const [programForm, setProgramForm] = useState({
    id: "", title: "", category: "general", description: "", salary: "", duration: "", source: "", 
    what_you_learn: [] as string[],
    requirements: [] as { req_id: string, label: string, note: string }[],
    links: [] as { label: string, url: string, description: string }[]
  });

  const [announcementForm, setAnnouncementForm] = useState({
      id: "", title: "", type: "popup" as "popup" | "marquee", direction: "left" as "left" | "right", is_active: true,
      content: [] as any[]
  });
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // --- HELPER FUNCTIONS ---
  const resetForm = () => {
    setFormData({ 
        id: "", title: "", description: "", slug: "", order_index: 0, 
        german: "", indonesian: "", example: "", category: "noun",
        explanation: "", examples: "", 
        dialog_lines: [{ speaker: "A", german: "", indonesian: "" }, { speaker: "B", german: "", indonesian: "" }],
        question: "", options: ["", "", "", ""], correct_answer_idx: "0"
    });
    setAnnouncementForm({ id: "", title: "", type: "popup", direction: "left", is_active: true, content: [{ type: "text", content: "" }] });
  };

  const addContentBlock = (type: "text" | "list" | "table" | "image") => {
    let newBlock;
    if (type === "text") newBlock = { type: "text", content: "" };
    else if (type === "list") newBlock = { type: "list", items: ["Item 1", "Item 2"] };
    else if (type === "image") newBlock = { type: "image", src: "", alt: "Deskripsi gambar" };
    else if (type === "table") newBlock = { type: "table", headers: ["Kolom A", "Kolom B"], rows: [["Isi A", "Isi B"]] };
    setMaterialForm(prev => ({ ...prev, content: [...prev.content, newBlock] }));
  };

  const updateContentBlock = (index: number, key: string, value: any) => {
    const newContent = [...materialForm.content];
    if (newContent[index].type === "list" && key === "items_raw") newContent[index].items = value.split("\n"); 
    else if (newContent[index].type === "table" && key === "csv_raw") {
        const lines = value.split("\n");
        const headers = lines[0] ? lines[0].split(",").map((s: string) => s.trim()) : [];
        const rows = lines.slice(1).map((line: string) => line.split(",").map((s: string) => s.trim()));
        newContent[index].headers = headers; newContent[index].rows = rows;
    } else newContent[index] = { ...newContent[index], [key]: value };
    setMaterialForm({ ...materialForm, content: newContent });
  };
  
  const removeContentBlock = (index: number) => { const newContent = materialForm.content.filter((_, i) => i !== index); setMaterialForm({ ...materialForm, content: newContent }); };

  const handleMoveContentBlock = (index: number, direction: 'up' | 'down') => {
      const newContent = [...materialForm.content];
      if (direction === 'up' && index > 0) {
          [newContent[index], newContent[index - 1]] = [newContent[index - 1], newContent[index]];
      } else if (direction === 'down' && index < newContent.length - 1) {
          [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
      }
      setMaterialForm({ ...materialForm, content: newContent });
  };

  const addAnnounceBlock = (type: "text" | "list" | "table" | "image") => {
      let newBlock;
      if (type === "text") newBlock = { type: "text", content: "" };
      else if (type === "list") newBlock = { type: "list", items: ["Item 1", "Item 2"] };
      else if (type === "image") newBlock = { type: "image", src: "", alt: "Deskripsi" };
      else if (type === "table") newBlock = { type: "table", headers: ["A", "B"], rows: [["1", "2"]] };
      setAnnouncementForm(prev => ({ ...prev, content: [...prev.content, newBlock] }));
  };
  
  const updateAnnounceBlock = (index: number, key: string, value: any) => {
      const newContent = [...announcementForm.content];
      if (newContent[index].type === "list" && key === "items_raw") newContent[index].items = value.split("\n");
      else if (newContent[index].type === "table" && key === "csv_raw") {
        const lines = value.split("\n");
        const headers = lines[0] ? lines[0].split(",").map((s: string) => s.trim()) : [];
        const rows = lines.slice(1).map((line: string) => line.split(",").map((s: string) => s.trim()));
        newContent[index].headers = headers; newContent[index].rows = rows;
      } else newContent[index] = { ...newContent[index], [key]: value };
      setAnnouncementForm({ ...announcementForm, content: newContent });
  };
  
  const removeAnnounceBlock = (index: number) => { const newContent = announcementForm.content.filter((_, i) => i !== index); setAnnouncementForm({ ...announcementForm, content: newContent }); };

  const formatAnnounceText = (index: number, tag: string, value: string) => {
      const textarea = document.getElementById(`announce-text-${index}`) as HTMLTextAreaElement;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return; 
      const selection = value.substring(start, end);
      let formatted = "";
      if (tag === 'b') formatted = `<b>${selection}</b>`;
      else if (tag === 'i') formatted = `<i>${selection}</i>`;
      else if (tag === 'u') formatted = `<u>${selection}</u>`;
      else if (tag === 'a') formatted = `<a href="#">${selection}</a>`;
      const newValue = value.substring(0, start) + formatted + value.substring(end);
      updateAnnounceBlock(index, "content", newValue);
  };

  const getTableAsCSV = (block: any) => { if (!block.headers || !block.rows) return ""; const headerStr = block.headers.join(", "); const rowsStr = block.rows.map((row: string[]) => row.join(", ")).join("\n"); return `${headerStr}\n${rowsStr}`; };

  // 1. CEK ROLE & INIT
  useEffect(() => {
    const checkRole = async () => {
      if (!user) { setIsCheckingRole(false); return; }
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (user.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
      if (data?.role === "admin") { setIsAdmin(true); fetchLevels(); fetchQuizzes(); fetchStats(); fetchPrograms(); fetchAnnouncements(); }
      setIsCheckingRole(false);
    };
    checkRole();
  }, [user]);

  // 2. FETCH DATA
  const fetchStats = async () => {
      const { count: cLevels } = await supabase.from("levels").select("*", { count: "exact", head: true });
      const { count: cLessons } = await supabase.from("lessons").select("*", { count: "exact", head: true });
      const { count: cVocabs } = await supabase.from("vocabularies").select("*", { count: "exact", head: true });
      const { count: cMaterials } = await supabase.from("course_materials").select("*", { count: "exact", head: true });
      const { count: cQuestions } = await supabase.from("quiz_questions").select("*", { count: "exact", head: true });
      const { count: cPrograms } = await supabase.from("programs").select("*", { count: "exact", head: true });
      const { count: cAnnounce } = await supabase.from("announcements").select("*", { count: "exact", head: true });
      setStats({ levels: cLevels || 0, lessons: cLessons || 0, vocabs: cVocabs || 0, materials: cMaterials || 0, questions: cQuestions || 0, programs: cPrograms || 0, announcements: cAnnounce || 0 });
  };

  const fetchLevels = async () => { const { data } = await supabase.from("levels").select("*").order("id"); if (data) setLevels(data); };
  const fetchQuizzes = async () => { const { data } = await supabase.from("quizzes").select("*").order("level"); if (data) setQuizzes(data); };
  const fetchPrograms = async () => {
      const { data } = await supabase.from("programs").select("*").order("id");
      if (data) {
          setPrograms(data);
          const dbCategories = Array.from(new Set(data.map(p => p.category))).filter(Boolean);
          const defaultKeys = Object.keys(defaultCategoryLabels);
          const combinedCats = Array.from(new Set([...defaultKeys, ...dbCategories]));
          setCategoryList(combinedCats);
      }
  };
  const fetchAnnouncements = async () => {
      const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (data) setAnnouncements(data);
  };

  const fetchLessons = async (levelId: string) => { setIsLoadingData(true); const { data } = await supabase.from("lessons").select("*").eq("level_id", levelId).order("order_index"); if (data) setLessons(data); setIsLoadingData(false); };
  const fetchVocabs = async (lessonId: string) => { setIsLoadingData(true); const { data } = await supabase.from("vocabularies").select("*").eq("lesson_id", lessonId).order("german"); if (data) setVocabs(data); setIsLoadingData(false); };
  
  const fetchDialogs = async (lessonId: string) => { 
      setIsLoadingData(true); 
      const { data: dialogsData } = await supabase.from("dialogs").select("*").eq("lesson_id", lessonId);
      if (dialogsData) {
        const dialogIds = dialogsData.map(d => d.id);
        const { data: linesData } = await supabase.from("dialog_lines").select("*").in("dialog_id", dialogIds).order("order_index");
        const mergedDialogs = dialogsData.map(d => ({ ...d, dialog_lines: linesData ? linesData.filter(l => l.dialog_id === d.id) : [] }));
        setDialogs(mergedDialogs); 
      }
      setIsLoadingData(false); 
  };
  
  const fetchExercises = async (lessonId: string) => { 
      setIsLoadingData(true); 
      const { data } = await supabase.from("exercises").select("*").eq("lesson_id", lessonId); 
      if (data) {
          const parsed = data.map(ex => ({ ...ex, options: typeof ex.options === 'string' ? JSON.parse(ex.options) : ex.options }));
          setExercises(parsed); 
      }
      setIsLoadingData(false); 
  };
  
  const fetchMaterials = async (levelId: string) => { setIsLoadingData(true); const { data } = await supabase.from("course_materials").select("*").eq("level_id", levelId).order("order_index"); if (data) setMaterials(data); setIsLoadingData(false); };
  const fetchQuizQuestions = async (quizId: string) => { setIsLoadingData(true); const { data } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index"); if (data) setQuizQuestions(data); setIsLoadingData(false); };

  useEffect(() => {
    if (selectedLevelId) {
        if (activeMenu === "vocab") { fetchLessons(selectedLevelId); setSelectedLessonId(null); setVocabs([]); setVocabSearchTerm(""); } 
        else if (activeMenu === "material") { fetchMaterials(selectedLevelId); }
    }
  }, [selectedLevelId, activeMenu]);

  useEffect(() => { 
      if (selectedLessonId && activeMenu === "vocab") {
          setIsLoadingData(true);
          fetchVocabs(selectedLessonId); 
          fetchDialogs(selectedLessonId); 
          fetchExercises(selectedLessonId);
          setIsLoadingData(false);
      } 
  }, [selectedLessonId, activeMenu]); 
  
  useEffect(() => {
      if (selectedQuizId) { fetchQuizQuestions(selectedQuizId); setEditingQuestion(null); setQuizQuestionText(""); setQuizExplanation(""); }
  }, [selectedQuizId]);

  const filteredPrograms = programs.filter(prog => {
        const matchesSearch = prog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prog.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = programFilter === "all" ? true :
                            programFilter === "general" ? prog.category === "general" :
                            prog.category !== "general"; // 'ausbildung' mode

        const matchesCategory = categoryFilter === "all" ? true : prog.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    const totalGeneral = programs.filter(p => p.category === "general").length;
    const totalAusbildung = programs.filter(p => p.category !== "general").length;

  const handleMoveMaterial = async (item: CourseMaterialDB, direction: 'up' | 'down') => {
      const currentIndex = materials.findIndex(m => m.id === item.id);
      if (currentIndex === -1) return;
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= materials.length) return;
      const neighborItem = materials[targetIndex];
      setIsLoadingData(true);
      try {
          const update1 = await supabase.from('course_materials').update({ order_index: neighborItem.order_index }).eq('id', item.id); if (update1.error) throw update1.error;
          const update2 = await supabase.from('course_materials').update({ order_index: item.order_index }).eq('id', neighborItem.id); if (update2.error) throw update2.error;
          await fetchMaterials(selectedLevelId!); toast({ title: "Urutan Berhasil Diubah! 🔄" });
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Reorder", description: err.message }); } finally { setIsLoadingData(false); }
  };

  const handleMoveQuizQuestion = async (item: QuizQuestionDB, direction: 'up' | 'down') => {
      const currentIndex = quizQuestions.findIndex(q => q.id === item.id);
      if (currentIndex === -1) return;
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= quizQuestions.length) return;
      const neighborItem = quizQuestions[targetIndex];
      setIsLoadingData(true);
      try {
          const update1 = await supabase.from('quiz_questions').update({ order_index: neighborItem.order_index }).eq('id', item.id); if (update1.error) throw update1.error;
          const update2 = await supabase.from('quiz_questions').update({ order_index: item.order_index }).eq('id', neighborItem.id); if (update2.error) throw update2.error;
          await fetchQuizQuestions(selectedQuizId); toast({ title: "Urutan Soal Diubah! 🔄" });
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Reorder", description: err.message }); } finally { setIsLoadingData(false); }
  };

  const loadQuestionForEdit = (q: QuizQuestionDB) => {
      setEditingQuestion(q); setQuizQuestionText(q.question); setQuizType(q.type as any); setQuizExplanation(q.explanation || "");
      if (q.type === 'multiple-choice') { setQuizOptions(q.options || ["", "", ""]); setQuizCorrectOption(q.correct_answer || ""); } 
      else if (q.type === 'fill-blank') { setQuizBlankAnswer(q.correct_answer || ""); } 
      else if (q.type === 'reorder') { setQuizReorderSentence(Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : ""); }
  };

  const openEditDialog = (item: any, type: "vocab" | "lesson" | "dialog" | "exercise" | "announcement") => { 
      setFormType(type as any); setEditingItem(item); 
      if (type === 'vocab') setFormData({ ...formData, ...item, category: item.category || 'noun' });
      else if (type === 'dialog') {
          const mappedLines = item.dialog_lines ? item.dialog_lines.map((l: any) => ({ speaker: l.speaker, german: l.german, indonesian: l.indonesian || "" })) : [];
          setFormData({ ...formData, id: item.id, title: item.title, dialog_lines: mappedLines });
      }
      else if (type === 'exercise') setFormData({ ...formData, id: item.id, question: item.question, options: item.options, correct_answer_idx: String(item.correct_answer) });
      else if (type === 'announcement') setAnnouncementForm({ id: item.id, title: item.title, content: item.content, type: item.type, direction: item.direction || 'left', is_active: item.is_active });
      else setFormData({ ...formData, ...item });
      setDialogOpen(true); 
  };
  
  const openCreateDialog = (type: "vocab" | "lesson" | "dialog" | "exercise" | "announcement") => { 
      setFormType(type as any); setEditingItem(null); resetForm(); setDialogOpen(true); 
  };
  
  const openMaterialDialog = (item: any | null) => {
      setEditingItem(item);
      if (item) {
          const rawContent = item.content;
          const parsedContent = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
          const tipsStr = item.tips && Array.isArray(item.tips) ? item.tips.join("\n") : "";
          setMaterialForm({
              id: item.id, title: item.title, section_id: item.section_id, level_id: item.level_id, order_index: item.order_index,
              content: Array.isArray(parsedContent) ? parsedContent : [],
              resources: item.resources ? item.resources.map((r: any) => ({...r, type: r.type || 'web'})) : [],
              tips: tipsStr,
              status: item.status || "draft"
          });
      } else {
          setMaterialForm({ id: "", title: "", section_id: "", level_id: selectedLevelId || "A1", order_index: 0, content: [{ type: "text", content: "" }], resources: [], tips: "", status: "draft" });
      }
      setMaterialDialogOpen(true);
  };

  const openProgramDialog = async (item: any | null) => {
      setEditingItem(item); setIsCustomCategory(false);
      if (item) {
          const { data: reqs } = await supabase.from('program_requirements').select('*').eq('program_id', item.id);
          const { data: links } = await supabase.from('program_links').select('*').eq('program_id', item.id);
          setProgramForm({
              id: item.id, title: item.title, category: item.category || "health", description: item.description || "",
              salary: item.salary || "", duration: item.duration || "", source: item.source || "", 
              what_you_learn: item.what_you_learn || [],
              requirements: reqs?.map(r => ({ req_id: r.req_id, label: r.label, note: r.note || "" })) || [],
              links: links?.map(l => ({ label: l.label, url: l.url, description: l.description || "" })) || []
          });
      } else {
          setProgramForm({ id: "", title: "", category: "general", description: "", salary: "", duration: "", source: "", what_you_learn: [], requirements: [], links: [] });
      }
      setProgramDialogOpen(true);
  };

  const openAnnouncementDialog = (item: any | null) => {
      setEditingItem(item);
      if (item) {
          const rawContent = item.content;
          const parsedContent = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
          setAnnouncementForm({
              id: item.id, title: item.title, type: item.type, direction: item.direction || "left", is_active: item.is_active,
              content: Array.isArray(parsedContent) ? parsedContent : []
          });
      } else {
          setAnnouncementForm({ id: "", title: "", type: "popup", direction: "left", is_active: true, content: [{ type: "text", content: "" }] });
      }
      setAnnouncementDialogOpen(true);
  };

  const confirmDelete = (item: any, type: string) => { setItemToDelete({ id: item.id, type }); setDeleteDialogOpen(true); }

  const performDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    setIsUploading(true);
    
    try {
        let error = null;

        if (type === "vocab") { 
            const { error: err, count } = await supabase.from("vocabularies").delete({ count: 'exact' }).eq("id", id);
            error = err;
            if (!err && count === 0) throw new Error("Gagal menghapus. Data tidak ditemukan atau dilindungi RLS.");
            if (!err) setVocabs(prev => prev.filter(v => v.id !== id));
        }
        else if (type === "dialog") { 
            const { error: err } = await supabase.from("dialogs").delete().eq("id", id);
            error = err;
            if (!err) setDialogs(prev => prev.filter(d => d.id !== id));
        }
        else if (type === "exercise") { 
            const { error: err } = await supabase.from("exercises").delete().eq("id", id);
            error = err;
            if (!err) setExercises(prev => prev.filter(e => e.id !== id));
        }
        else if (type === "lesson") { 
            const { error: err } = await supabase.from("lessons").delete().eq("id", id);
            error = err;
            if (!err) setLessons(prev => prev.filter(l => l.id !== id));
        }
        else if (type === "material") { 
            const { error: err } = await supabase.from("course_materials").delete().eq("id", id);
            error = err;
            if (!err) setMaterials(prev => prev.filter(m => m.id !== id));
        }
        else if (type === "program") { 
            const { error: err } = await supabase.from("programs").delete().eq("id", id);
            error = err;
            if (!err) setPrograms(prev => prev.filter(p => p.id !== id));
        }
        else if (type === "quiz_question") { 
            const { error: err } = await supabase.from("quiz_questions").delete().eq("id", id);
            error = err;
            if (!err) setQuizQuestions(prev => prev.filter(q => q.id !== id));
        }
        else if (type === "announcement") { 
            const { error: err } = await supabase.from("announcements").delete().eq("id", id);
            error = err;
            if (!err) setAnnouncements(prev => prev.filter(a => a.id !== id));
        }

        if (error) throw error;
        toast({ title: "Terhapus ✅", description: "Data berhasil dihapus permanen." }); 
        fetchStats();

    } catch (err: any) { 
        console.error("Delete Error:", err); 
        toast({ variant: "destructive", title: "Gagal Hapus ❌", description: err.message || "Database menolak." }); 
    } finally { 
        setIsUploading(false); 
        setDeleteDialogOpen(false); 
        setItemToDelete(null); 
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      let error = null;

      if (formType === "vocab") {
        if (!selectedLessonId) throw new Error("Pilih Bab dulu!");

        const vocabInput = formData.german.trim();
        
        const { data: existingVocab } = await supabase
          .from("vocabularies")
          .select("id, german, lesson_id, lessons(title)") 
          .ilike("german", vocabInput)
          .maybeSingle();

        if (existingVocab && (!editingItem || editingItem.id !== existingVocab.id)) {
            const babName = (existingVocab.lessons as any)?.title || "Bab Lain";
            toast({ variant: "destructive", title: "Gagal Simpan! 🚫", description: `Kata "${existingVocab.german}" sudah terdaftar di bab "${babName}"!` });
            setIsUploading(false);
            return;
        }

        const payload = { 
            german: vocabInput, 
            indonesian: formData.indonesian, 
            example: formData.example, 
            lesson_id: selectedLessonId,
            category: formData.category || 'noun' 
        };
        
        if (editingItem) { 
            const { data: updated, error: err } = await supabase.from("vocabularies").update(payload).eq("id", editingItem.id).select(); 
            error = err;
            if (!err && (!updated || updated.length === 0)) throw new Error("Update gagal (RLS atau ID salah).");
        }
        else { 
            const { error: err } = await supabase.from("vocabularies").insert(payload); 
            error = err; 
        }
        
        if (!error) await fetchVocabs(selectedLessonId); 
      
      } else if (formType === "dialog") {
         const payload = { title: formData.title, lesson_id: selectedLessonId };
         let dialogId = editingItem?.id;
         if (dialogId) {
             const { error: err } = await supabase.from("dialogs").update(payload).eq("id", dialogId); if (err) throw err;
         } else {
             const { data: newDialog, error: err } = await supabase.from("dialogs").insert(payload).select().single(); if (err) throw err; dialogId = newDialog.id;
         }
         await supabase.from("dialog_lines").delete().eq("dialog_id", dialogId);
         if (formData.dialog_lines.length > 0) {
             const linesPayload = formData.dialog_lines.map((line, idx) => ({ dialog_id: dialogId, speaker: line.speaker, german: line.german, indonesian: line.indonesian, order_index: idx }));
             const { error: errLines } = await supabase.from("dialog_lines").insert(linesPayload); if (errLines) throw errLines;
         }
         if (!error) await fetchDialogs(selectedLessonId!);
      } else if (formType === "exercise") {
         const payload = { question: formData.question, options: formData.options, correct_answer: parseInt(formData.correct_answer_idx as string), lesson_id: selectedLessonId };
         if (editingItem) { const { error: err } = await supabase.from("exercises").update(payload).eq("id", editingItem.id); error = err; }
         else { const { error: err } = await supabase.from("exercises").insert(payload); error = err; }
         if (!error) await fetchExercises(selectedLessonId!);
      } else if (formType === "lesson") {
        if (!selectedLevelId) throw new Error("Pilih Level dulu!");
        const payload = { title: formData.title, slug: formData.slug, order_index: formData.order_index, level_id: selectedLevelId };
        if (editingItem) { const { error: err } = await supabase.from("lessons").update(payload).eq("id", editingItem.id); error = err; }
        else { const { error: err } = await supabase.from("lessons").insert(payload); error = err; }
        if (!error) await fetchLessons(selectedLevelId);
      }
      else if (formType === "announcement") {
          const payload = { title: announcementForm.title, content: announcementForm.content, type: announcementForm.type, direction: announcementForm.direction, is_active: announcementForm.is_active };
          if (editingItem) { const { error: err } = await supabase.from("announcements").update(payload).eq("id", editingItem.id); error = err; }
          else { const { error: err } = await supabase.from("announcements").insert(payload); error = err; }
          if (!error) await fetchAnnouncements();
      }

      if (error) throw error;
      toast({ title: "Berhasil! ✅", description: "Data berhasil disimpan." });
      setDialogOpen(false); resetForm(); fetchStats();
    } catch (err: any) { 
        console.error(err);
        if (err.message.includes("duplicate key") || err.code === "23505") {
             toast({ variant: "destructive", title: "Duplikat!", description: "Data ini sudah ada di database." });
        } else {
             toast({ variant: "destructive", title: "Gagal Simpan", description: err.message }); 
        }
    } finally { setIsUploading(false); }
  };

  const handleSaveMaterial = async () => {
      setIsUploading(true);
      try {
          const tipsArray = materialForm.tips.split("\n").filter(t => t.trim() !== "");
          const payload = {
              level_id: materialForm.level_id, section_id: materialForm.section_id, title: materialForm.title,
              order_index: materialForm.order_index, content: materialForm.content, resources: materialForm.resources,
              tips: tipsArray,
              status: materialForm.status
          };
          let error = null;
          if (editingItem) { const { error: err } = await supabase.from("course_materials").update(payload).eq("id", editingItem.id); error = err; }
          else { const { error: err } = await supabase.from("course_materials").insert(payload); error = err; }
          if (error) throw error;
          toast({ title: "Materi Tersimpan! 📚", description: "Database diperbarui." });
          setMaterialDialogOpen(false); if (selectedLevelId) fetchMaterials(selectedLevelId); fetchStats();
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Simpan", description: err.message }); } finally { setIsUploading(false); }
  };

  const handleSaveProgram = async () => {
      setIsUploading(true);
      try {
        const programPayload = {
            id: programForm.id, title: programForm.title, category: programForm.category, description: programForm.description, salary: programForm.salary, duration: programForm.duration, source: programForm.source, what_you_learn: programForm.what_you_learn
        };
        const { error: progError } = await supabase.from('programs').upsert(programPayload);
        if (progError) throw progError;
        await supabase.from('program_requirements').delete().eq('program_id', programForm.id);
        if (programForm.requirements.length > 0) {
            const reqPayload = programForm.requirements.map(r => ({ program_id: programForm.id, req_id: r.req_id, label: r.label, note: r.note }));
            const { error: reqError } = await supabase.from('program_requirements').insert(reqPayload);
            if (reqError) throw reqError;
        }
        await supabase.from('program_links').delete().eq('program_id', programForm.id);
        if (programForm.links.length > 0) {
            const linkPayload = programForm.links.map(l => ({ program_id: programForm.id, label: l.label, url: l.url, description: l.description }));
            const { error: linkError } = await supabase.from('program_links').insert(linkPayload);
            if (linkError) throw linkError;
        }
        toast({ title: "Program Tersimpan! 🎓", description: "Database program diperbarui." });
        setProgramDialogOpen(false); fetchPrograms(); fetchStats();
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Simpan Program", description: err.message }); } finally { setIsUploading(false); }
  };

  const handleSaveAnnouncement = async () => {
      setIsUploading(true);
      try {
          const payload = {
              title: announcementForm.title, type: announcementForm.type, direction: announcementForm.direction,
              is_active: announcementForm.is_active, content: announcementForm.content
          };
          let error = null;
          if (editingItem) { const { error: err } = await supabase.from("announcements").update(payload).eq("id", editingItem.id); error = err; }
          else { const { error: err } = await supabase.from("announcements").insert(payload); error = err; }
          if (error) throw error;
          toast({ title: "Pengumuman Disimpan! 📢", description: "Database diperbarui." });
          setAnnouncementDialogOpen(false); fetchAnnouncements(); fetchStats();
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Simpan", description: err.message }); } finally { setIsUploading(false); }
  };

  const handleSaveQuizQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) { toast({ variant: "destructive", title: "Error", description: "Pilih level quiz dulu!" }); return; }
    setIsUploading(true);
    try {
      let finalOptions: any = null; let finalAnswer: any = null;
      if (quizType === "multiple-choice") { finalOptions = quizOptions; finalAnswer = quizCorrectOption; }
      else if (quizType === "fill-blank") { finalAnswer = quizBlankAnswer; }
      else if (quizType === "reorder") { const parts = quizReorderSentence.split(",").map(s => s.trim()); finalOptions = [...parts].sort(() => Math.random() - 0.5); finalAnswer = parts; }
      if (editingQuestion) {
          const { error } = await supabase.from("quiz_questions").update({ question: quizQuestionText, type: quizType, options: finalOptions, correct_answer: finalAnswer, explanation: quizExplanation }).eq('id', editingQuestion.id);
          if (error) throw error;
      } else {
          const { count } = await supabase.from("quiz_questions").select("*", { count: 'exact', head: true }).eq("quiz_id", selectedQuizId);
          const newOrder = (count || 0) + 1;
          const { error } = await supabase.from("quiz_questions").insert({ quiz_id: selectedQuizId, question: quizQuestionText, type: quizType, options: finalOptions, correct_answer: finalAnswer, explanation: quizExplanation, order_index: newOrder });
          if (error) throw error;
      }
      toast({ title: "Soal Tersimpan! 🧠", description: "Database diperbarui." });
      setEditingQuestion(null); setQuizQuestionText(""); setQuizExplanation(""); fetchStats(); fetchQuizQuestions(selectedQuizId);
    } catch (err: any) { toast({ variant: "destructive", title: "Gagal Simpan", description: err.message }); } finally { setIsUploading(false); }
  };

    const handleSmartImport = async () => {
        if (!jsonInput) return;
        setIsUploading(true);
        try {
            const rawData = JSON.parse(jsonInput);
            // Menstandarisasi agar input selalu berupa Array, meskipun yang dimasukkan cuma 1 data
            const items = Array.isArray(rawData) ? rawData : [rawData];
            let totalImported = 0;

            for (const item of items) {
                // --- 1. VOCAB & LESSON ---
                if (importType === "vocab") {
                    let lessonId;
                    const { data: existingLesson } = await supabase.from("lessons").select("id").eq("slug", item.slug).maybeSingle();
                    
                    if (existingLesson) {
                        lessonId = existingLesson.id;
                    } else {
                        const { data: newLesson, error: createError } = await supabase.from("lessons").insert({
                            level_id: item.level_id,
                            slug: item.slug,
                            title: item.title,
                            order_index: item.order_index || 99
                        }).select().single();
                        if (createError) throw createError;
                        lessonId = newLesson.id;
                    }

                    if (item.vocabulary?.length) {
                        const uniqueVocabs = item.vocabulary.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.german === v.german) === i);
                        for (const v of uniqueVocabs) {
                            const { data: exist } = await supabase.from("vocabularies").select("id").eq("german", v.german).maybeSingle();
                            if (!exist) {
                                await supabase.from("vocabularies").insert({ 
                                    lesson_id: lessonId, german: v.german, indonesian: v.indonesian, example: v.example, category: v.category || 'noun' 
                                });
                            }
                        }
                    }

                    if (item.dialogs?.length) {
                        for (const d of item.dialogs) {
                            const { data: newDialog } = await supabase.from("dialogs").insert({ lesson_id: lessonId, title: d.title }).select().single();
                            if (d.lines?.length && newDialog) {
                                const linesPayload = d.lines.map((l: any, i: number) => ({ 
                                    dialog_id: newDialog.id, speaker: l.speaker, german: l.german, indonesian: l.indonesian, order_index: i 
                                }));
                                await supabase.from("dialog_lines").insert(linesPayload);
                            }
                        }
                    }

                    if (item.exercises?.length) {
                        const exPayload = item.exercises.map((e: any) => ({
                            lesson_id: lessonId, question: e.question, options: e.options, correct_answer: e.correct_answer 
                        }));
                        await supabase.from("exercises").insert(exPayload);
                    }
                }

                // --- 2. MATERIAL BACAAN ---
                else if (importType === "material") {
                    const { data: existingMat } = await supabase.from("course_materials").select("id").eq("section_id", item.section_id).maybeSingle();
                    if (existingMat) {
                        await supabase.from("course_materials").update({ 
                            title: item.title, content: item.content, level_id: item.level_id, order_index: item.order_index 
                        }).eq("id", existingMat.id);
                    } else {
                        await supabase.from("course_materials").insert({
                            level_id: item.level_id, section_id: item.section_id, title: item.title, order_index: item.order_index || 99, content: item.content
                        });
                    }
                }

                // --- 3. PROGRAM STUDI ---
                else if (importType === "program") {
                    const { error: progError } = await supabase.from('programs').upsert({ 
                        id: item.id, title: item.title, category: item.category, description: item.description, 
                        salary: item.salary, duration: item.duration, source: item.source, 
                        what_you_learn: item.what_you_learn || item.whatYouLearn 
                    });
                    if (progError) throw progError;

                    if (item.requirements?.length) {
                        const reqPayload = item.requirements.map((r: any) => ({ program_id: item.id, req_id: r.id || r.req_id, label: r.label, note: r.note }));
                        await supabase.from('program_requirements').delete().eq('program_id', item.id);
                        await supabase.from('program_requirements').insert(reqPayload);
                    }
                    if (item.usefulLinks?.length || item.links?.length) {
                        const linksSource = item.usefulLinks || item.links;
                        const linkPayload = linksSource.map((l: any) => ({ program_id: item.id, label: l.label, url: l.url, description: l.description }));
                        await supabase.from('program_links').delete().eq('program_id', item.id);
                        await supabase.from('program_links').insert(linkPayload);
                    }
                }

                // --- 4. QUIZ EDITOR ---
                else if (importType === "quiz") {
                    let quizId;
                    const { data: existingQuiz } = await supabase.from("quizzes").select("id").eq("level", item.level).maybeSingle();
                    
                    if (existingQuiz) {
                        quizId = existingQuiz.id;
                        await supabase.from("quizzes").update({ title: item.title }).eq("id", quizId);
                    } else {
                        const { data: newQuiz, error: qErr } = await supabase.from("quizzes").insert({ level: item.level, title: item.title }).select().single();
                        if (qErr) throw qErr;
                        quizId = newQuiz.id;
                    }

                    if (item.questions?.length) {
                        const questionsPayload = item.questions.map((q: any, idx: number) => ({ 
                            quiz_id: quizId, question: q.question, type: q.type, options: q.options || null, 
                            correct_answer: q.correct_answer, explanation: q.explanation || "", order_index: idx + 1 
                        }));
                        // Hapus soal lama jika ingin mereplace seluruh kuis
                        await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
                        const { error: qError } = await supabase.from("quiz_questions").insert(questionsPayload);
                        if (qError) throw qError;
                    }
                }
                totalImported++;
            }

            toast({ title: "Bulk Import Berhasil! ✅", description: `${totalImported} data ${importType} telah diproses.` });
            setJsonInput(""); 
            fetchStats();
            if (importType === "program") fetchPrograms();
            if (importType === "quiz") fetchQuizzes();

        } catch (e: any) { 
            console.error(e);
            toast({ variant: "destructive", title: "Gagal Import ❌", description: e.message }); 
        } finally { 
            setIsUploading(false); 
        }
    };

  const getPlaceholder = () => { 
      if (importType === "vocab") return `{\n "level_id": "A1",\n "slug": "a1-perkenalan",\n "title": "Perkenalan Diri",\n "vocabulary": [\n  {"german": "Hallo", "indonesian": "Halo", "example": "Hallo, wie geht's?", "category": "phrase"},\n  {"german": "der Tisch", "indonesian": "Meja", "example": "Das ist ein Tisch.", "category": "noun"}\n ]\n}`;
      if (importType === "material") return `{\n "level_id": "A1",\n "section_id": "a1_1_intro",\n "title": "Intro to German",\n "order_index": 1,\n "content": [\n  {"type": "text", "content": "Halo, selamat datang!"}\n ]\n}`;
      if (importType === "program") return `{\n "id": "aupair",\n "title": "Au Pair",\n "category": "general",\n "description": "Program pertukaran budaya...",\n "salary": "€280/bulan",\n "duration": "1 Tahun",\n "source": "aupair.com",\n "whatYouLearn": ["Budaya Jerman", "Bahasa Sehari-hari"],\n "requirements": [\n  {"id": "usia", "label": "Usia", "note": "18-26 Tahun"}\n ],\n "usefulLinks": [\n  {"label": "Official Info", "url": "https://...", "description": "Web resmi"}\n ]\n}`;
      if (importType === "quiz") return `{\n "level": "A1",\n "title": "Ujian A1 Dasar",\n "questions": [\n  {\n   "question": "Apa arti 'Danke'?",\n   "type": "multiple-choice",\n   "options": ["Halo", "Terima Kasih", "Maaf"],\n   "correct_answer": "Terima Kasih",\n   "explanation": "Danke artinya terima kasih."\n  }\n ]\n}`;
      return `{\n "note": "Pilih tipe data dulu..." \n}`;
  };

  if (isCheckingRole) return <div className="h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="animate-spin h-10 w-10 text-indigo-600"/></div>;
  if (!user || !isAdmin) return <div className="h-screen flex items-center justify-center bg-[#f8f9fa] text-slate-500 font-bold">Akses Ditolak. Anda bukan Administrator.</div>;

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* SIDEBAR */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={cn("fixed lg:relative z-50 h-screen w-64 bg-white transition-transform duration-300 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]", mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-sm"><Crown size={18}/></div>
          <span className="text-[17px] font-extrabold tracking-tight text-slate-900">AdminPanel</span>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-slate-900"><X size={20}/></button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4 custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          <NavItem active={activeMenu === "dashboard"} icon={<LayoutDashboard size={18}/>} label="Dashboard" onClick={() => {setActiveMenu("dashboard"); setMobileMenuOpen(false);}} />
          <NavItem active={activeMenu === "material"} icon={<BookText size={18}/>} label="Materi Bacaan" onClick={() => {setActiveMenu("material"); setMobileMenuOpen(false);}} />
          <NavItem active={activeMenu === "vocab"} icon={<Database size={18}/>} label="Database Kosakata" onClick={() => {setActiveMenu("vocab"); setMobileMenuOpen(false);}} />
          <NavItem active={activeMenu === "quiz"} icon={<HelpCircle size={18}/>} label="Quiz Editor" onClick={() => {setActiveMenu("quiz"); setMobileMenuOpen(false);}} />
          <NavItem active={activeMenu === "program"} icon={<GraduationCap size={18}/>} label="Program Studi" onClick={() => {setActiveMenu("program"); setMobileMenuOpen(false);}} />
          <div className="pt-8">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">System Utilities</p>
            <NavItem active={activeMenu === "announcement"} icon={<Megaphone size={18}/>} label="Pengumuman" onClick={() => {setActiveMenu("announcement"); setMobileMenuOpen(false);}} />
            <NavItem active={activeMenu === "import"} icon={<FileJson size={18}/>} label="Import JSON" onClick={() => {setActiveMenu("import"); setMobileMenuOpen(false);}} />
          </div>
        </nav>
        <div className="p-6">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
             <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                 <UserCircle size={18}/>
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-900 truncate">{fullName}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">Head Administrator</p>
             </div>
             <button onClick={() => navigate("/dashboard")} className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5" title="Kembali ke Beranda"> <Home size={18}/> </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* HEADER (Clean, no background, just padding) */}
        <header className="px-8 lg:px-12 py-6 flex items-center justify-between shrink-0 bg-[#f8f9fa]">
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-white rounded-xl shadow-sm"><Menu size={20}/></button>
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 pb-24 scroll-smooth custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-500">

            {/* --- 1. DASHBOARD --- */}
            {activeMenu === "dashboard" && (
                <div className="space-y-10">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[32px] font-bold text-slate-800 tracking-tight">Overview</h1>
                        <p className="text-slate-400 text-sm">Statistik cepat dan akses ringkas ke manajemen konten.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                            title="LEVEL BAHASA" 
                            value="A1 - B2" 
                            icon={<Layers className="text-indigo-600 w-5 h-5"/>}  
                            badgeColor="bg-emerald-100 text-emerald-700"
                            iconBg="bg-indigo-50"
                        />
                        <StatCard 
                            title="TOTAL KOSAKATA" 
                            value={stats.vocabs.toLocaleString()} 
                            icon={<BookOpen className="text-rose-600 w-5 h-5"/>} 
                            iconBg="bg-rose-50"
                        />
                        {/* The Dark Accent Card from reference */}
                        <div className="bg-[#111827] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <BookText className="text-white w-5 h-5"/>
                                </div>
                                {/* Badge untuk jumlah pengumuman */}
                                <div className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-indigo-500/20 text-indigo-300 flex items-center gap-2">
                                    <Megaphone size={12}/>
                                    {stats.announcements} PENGUMUMAN DIBUAT
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL MATERI BACAAN</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black tracking-tight text-white">{stats.materials}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Modul</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Status</span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        ACTIVE
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] overflow-hidden">
                        <div className="p-8 pb-6 border-b border-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Database Overview</h2>
                            <p className="text-sm text-slate-400 mt-1">Quick links to content creation.</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div onClick={() => setActiveMenu("material")} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer group flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><BookText className="text-indigo-600 w-5 h-5"/></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">Materi Bacaan</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Kelola teks dan referensi</p>
                                </div>
                            </div>
                            <div onClick={() => setActiveMenu("import")} className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group flex items-center gap-4 bg-slate-50/50">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><FileJson className="text-slate-500 w-5 h-5"/></div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Bulk JSON Import</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Upload data massal</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- 2. VOCAB, DIALOG, EXERCISE (Database Kosakata) --- */}
            {activeMenu === "vocab" && (
                <>
                    <div className="flex flex-col gap-1 mb-10">
                        <h1 className="text-[32px] font-bold text-slate-800 tracking-tight">Database Kosakata</h1>
                        <p className="text-slate-400 text-sm">Kelola bab, kosakata, dialog, dan latihan soal per level.</p>
                    </div>
                    {!selectedLessonId ? (
                        <>
                            {/* LEVEL SELECTOR (CLEAN) */}
                            <div className="mb-10">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select Level to Edit</p>
                                <div className="flex flex-wrap gap-3">
                                    {levels.map(l => (
                                        <button key={l.id} onClick={() => setSelectedLevelId(l.id)} className={cn("px-8 py-3.5 rounded-2xl text-sm font-bold transition-all border", selectedLevelId === l.id ? "bg-white border-indigo-600 text-indigo-600 shadow-[0_4px_20px_rgb(79,70,229,0.12)]" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 shadow-[0_2px_10px_rgb(0,0,0,0.02)]")}>
                                            Level {l.id}
                                        </button>
                                    ))}
                                    {levels.length > 0 && <Button variant="ghost" onClick={() => setSelectedLevelId(null)} className="h-[52px] rounded-2xl px-6 text-slate-400 hover:bg-white hover:text-slate-700">Clear</Button>}
                                </div>
                            </div>

                            <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Daftar Bab {selectedLevelId && `(${selectedLevelId})`}</h2>
                                    </div>
                                    {selectedLevelId && (
                                        <Button onClick={() => openCreateDialog("lesson")} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6 rounded-2xl shadow-sm"><Plus className="w-4 h-4 mr-2"/> Tambah Bab</Button>
                                    )}
                                </div>
                                <div className="overflow-x-auto p-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableHead className="font-bold text-slate-400 text-xs py-4 pl-4 uppercase tracking-wider">Topik / Bab</TableHead>
                                                <TableHead className="font-bold text-slate-400 text-xs py-4 uppercase tracking-wider">Level</TableHead>
                                                <TableHead className="font-bold text-slate-400 text-xs py-4 text-right pr-4 uppercase tracking-wider">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!selectedLevelId && <TableRow className="border-none"><TableCell colSpan={3} className="text-center py-20 text-slate-400 font-medium">Pilih level di atas untuk memunculkan bab.</TableCell></TableRow>}
                                            {selectedLevelId && lessons.length === 0 && <TableRow className="border-none"><TableCell colSpan={3} className="text-center py-20 text-slate-400 font-medium">Belum ada bab untuk level ini.</TableCell></TableRow>}
                                            {selectedLevelId && lessons.map((ls) => (
                                                <TableRow key={ls.id} className="hover:bg-slate-50/50 border-b border-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedLessonId(ls.id)}>
                                                    <TableCell className="py-5 pl-4">
                                                        <div className="font-bold text-slate-800 text-base">{ls.title}</div>
                                                        <div className="text-xs text-slate-400 mt-1 font-mono">{ls.slug} • Order #{ls.order_index}</div>
                                                    </TableCell>
                                                    <TableCell className="py-5">
                                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 shadow-none border-none font-bold uppercase text-[10px] px-3 py-1 rounded-lg">{ls.level_id}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4 py-5" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 bg-white shadow-sm border border-slate-100 rounded-xl" onClick={() => setSelectedLessonId(ls.id)}><ChevronRight size={16}/></Button>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 bg-white shadow-sm border border-slate-100 rounded-xl" onClick={() => openEditDialog(ls, "lesson")}><Edit2 size={14}/></Button>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-xl" onClick={() => confirmDelete(ls, "lesson")}><Trash2 size={14}/></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </>
                    ) : (
                        /* LESSON SELECTED VIEW */
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <Button variant="ghost" onClick={() => setSelectedLessonId(null)} className="mb-2 text-slate-400 hover:text-slate-800 hover:bg-white rounded-2xl px-0 h-10 font-bold"><ArrowLeft className="w-4 h-4 mr-2"/> Kembali ke Daftar Bab</Button>
                            
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">{lessons.find(l => l.id === selectedLessonId)?.title}</h2>
                                <p className="text-slate-400 text-sm">Kelola kosakata, dialog, dan latihan untuk bab ini.</p>
                            </div>

                            {/* SUB TABS NAVIGATION */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
                                <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                    {[
                                        {id: "vocab", label: "Kosakata"},
                                        {id: "dialog", label: "Dialog"},
                                        {id: "exercise", label: "Latihan Soal"},
                                    ].map((tab) => (
                                        <button 
                                            key={tab.id} onClick={() => setActiveVocabTab(tab.id as any)}
                                            className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", activeVocabTab === tab.id ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700")}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <Button onClick={() => openCreateDialog(activeVocabTab as any)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-[46px] px-6 rounded-2xl shadow-[0_4px_14px_rgba(79,70,229,0.2)]"><Plus className="w-4 h-4 mr-2"/> Tambah {activeVocabTab === 'vocab' ? 'Kosakata' : activeVocabTab === 'dialog' ? 'Dialog' : 'Soal'}</Button>
                            </div>

                            <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] overflow-hidden mt-6">
                                
                                {activeVocabTab === "vocab" && (
                                    <>
                                        <div className="p-6 border-b border-slate-50 flex items-center">
                                            <div className="relative flex-1 max-w-sm">
                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"/>
                                                <Input placeholder="Cari kata (Jerman/Indo)..." className="pl-11 h-11 bg-[#f8f9fa] border-transparent focus:border-indigo-100 focus:bg-white rounded-xl text-sm" value={vocabSearchTerm} onChange={e => setVocabSearchTerm(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto p-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-none hover:bg-transparent">
                                                        <TableHead className="font-bold text-slate-400 text-xs py-4 pl-4 uppercase tracking-wider">Jerman</TableHead>
                                                        <TableHead className="font-bold text-slate-400 text-xs py-4 uppercase tracking-wider">Arti</TableHead>
                                                        <TableHead className="font-bold text-slate-400 text-xs py-4 uppercase tracking-wider">Kategori</TableHead>
                                                        <TableHead className="font-bold text-slate-400 text-xs py-4 text-right pr-4 uppercase tracking-wider">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {isLoadingData && <TableRow className="border-none"><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto"/></TableCell></TableRow>}
                                                    {!isLoadingData && vocabs.length === 0 && <TableRow className="border-none"><TableCell colSpan={4} className="text-center py-20 text-slate-400 font-medium">Belum ada kosakata.</TableCell></TableRow>}
                                                    {!isLoadingData && vocabs.filter(v => v.german.toLowerCase().includes(vocabSearchTerm.toLowerCase()) || v.indonesian.toLowerCase().includes(vocabSearchTerm.toLowerCase())).map(v => (
                                                        <TableRow key={v.id} className="hover:bg-slate-50/50 border-b border-slate-50 transition-colors group">
                                                            <TableCell className="font-bold text-slate-800 text-base py-5 pl-4">{v.german}</TableCell>
                                                            <TableCell className="text-slate-500 py-5">{v.indonesian}</TableCell>
                                                            <TableCell className="py-5">
                                                                <Badge variant="outline" className="text-[10px] uppercase font-bold px-3 py-1 rounded-lg border-slate-200 text-slate-500 shadow-none bg-white">{v.category || "noun"}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right pr-4 py-5">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 bg-white shadow-sm border border-slate-100 rounded-xl" onClick={() => openEditDialog(v, "vocab")}><Edit2 size={14}/></Button>
                                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-xl" onClick={() => confirmDelete(v, "vocab")}><Trash2 size={14}/></Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                )}

                                {activeVocabTab === "dialog" && (
                                    <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto">
                                        {isLoadingData && <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto"/></div>}
                                        {!isLoadingData && dialogs.length === 0 && <p className="text-slate-400 font-medium text-center py-20">Belum ada dialog.</p>}
                                        {!isLoadingData && dialogs.map(d => (
                                            <div key={d.id} className="bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-[1.5rem] p-8 relative group hover:border-slate-200 transition-colors">
                                                <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-500 hover:text-indigo-600 shadow-sm font-bold" onClick={() => openEditDialog(d, "dialog")}><Edit2 className="w-3 h-3 mr-2"/> Edit</Button>
                                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-red-500 shadow-sm" onClick={() => confirmDelete(d, "dialog")}><Trash2 className="w-3 h-3"/></Button>
                                                </div>
                                                <h4 className="font-bold text-xl text-slate-800 mb-6 pr-32">{d.title}</h4>
                                                <div className="space-y-4 text-sm font-medium">
                                                    {d.dialog_lines && d.dialog_lines.length > 0 ? (
                                                        d.dialog_lines.map((l: any, i: number) => (
                                                            <div key={i} className="flex gap-4 items-start">
                                                                <span className="font-bold text-slate-500 bg-slate-50 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">{l.speaker}</span>
                                                                <div className="pt-1.5">
                                                                    <p className="text-slate-800 text-base">{l.german}</p>
                                                                    {l.indonesian && <p className="text-slate-400 text-sm mt-1">{l.indonesian}</p>}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : <span className="text-slate-300 italic">Kosong.</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeVocabTab === "exercise" && (
                                    <div className="overflow-x-auto p-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-none hover:bg-transparent">
                                                    <TableHead className="font-bold text-slate-400 text-xs py-4 pl-4 uppercase tracking-wider">Pertanyaan</TableHead>
                                                    <TableHead className="font-bold text-slate-400 text-xs py-4 uppercase tracking-wider">Kunci Jawaban</TableHead>
                                                    <TableHead className="font-bold text-slate-400 text-xs py-4 text-right pr-4 uppercase tracking-wider">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoadingData && <TableRow className="border-none"><TableCell colSpan={3} className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto"/></TableCell></TableRow>}
                                                {!isLoadingData && exercises.length === 0 && <TableRow className="border-none"><TableCell colSpan={3} className="text-center py-20 text-slate-400 font-medium">Belum ada latihan soal.</TableCell></TableRow>}
                                                {!isLoadingData && exercises.map(e => (
                                                    <TableRow key={e.id} className="hover:bg-slate-50/50 border-b border-slate-50 transition-colors group">
                                                        <TableCell className="font-bold text-slate-800 text-base py-5 pl-4 max-w-md truncate">{e.question}</TableCell>
                                                        <TableCell className="py-5">
                                                            <Badge className="bg-emerald-50 text-emerald-700 shadow-none border-none font-bold text-xs px-3 py-1 rounded-lg">{e.options && e.options[e.correct_answer] ? e.options[e.correct_answer] : `Opsi ${e.correct_answer}`}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-4 py-5">
                                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 bg-white shadow-sm border border-slate-100 rounded-xl" onClick={() => openEditDialog(e, "exercise")}><Edit2 size={14}/></Button>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-xl" onClick={() => confirmDelete(e, "exercise")}><Trash2 size={14}/></Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                </>
            )}

            {/* --- 3. MATERI BACAAN --- */}
            {activeMenu === "material" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[32px] font-bold text-slate-800 tracking-tight">Materi Bacaan</h1>
                        <p className="text-slate-400 text-sm">Kelola materi teks, bacaan, dan referensi eksternal.</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {levels.map(l => (
                                <button key={l.id} onClick={() => { setSelectedLevelId(l.id); fetchMaterials(l.id); }} className={cn("px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border", selectedLevelId === l.id ? "bg-white border-indigo-600 text-indigo-600 shadow-[0_4px_20px_rgb(79,70,229,0.12)]" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 shadow-[0_2px_10px_rgb(0,0,0,0.02)]")}>{l.id}</button>
                            ))}
                        </div>
                        <Button onClick={() => openMaterialDialog(null)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-6 rounded-2xl shadow-sm"><Plus className="w-4 h-4 mr-2"/> Buat Materi Baru</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((mat) => (
                            <div key={mat.id} className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-[2rem] p-8 flex flex-col h-full min-h-[260px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-2 items-center">
                                        <Badge variant="outline" className="bg-slate-50 text-[10px] font-mono font-bold text-slate-400 border-slate-200 rounded-lg px-2 py-1">{mat.section_id}</Badge>
                                        
                                        {/* Badge Status Berwarna */}
                                        <Badge className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-lg border shadow-none",
                                            mat.status === 'draft' && "bg-slate-100 text-slate-500 border-slate-200",
                                            mat.status === 'review' && "bg-amber-50 text-amber-600 border-amber-200",
                                            mat.status === 'published' && "bg-emerald-50 text-emerald-600 border-emerald-200",
                                            mat.status === 'rejected' && "bg-red-50 text-red-600 border-red-200",
                                            mat.status === 'archived' && "bg-slate-600 text-white border-transparent"
                                        )}>
                                            {mat.status || 'draft'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-bold text-slate-300 px-2 uppercase">Urutan #{mat.order_index}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-slate-300 hover:text-slate-700 hover:bg-slate-50" onClick={() => handleMoveMaterial(mat, 'up')} disabled={isLoadingData}><ArrowUp className="w-3 h-3"/></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-slate-300 hover:text-slate-700 hover:bg-slate-50" onClick={() => handleMoveMaterial(mat, 'down')} disabled={isLoadingData}><ArrowDown className="w-3 h-3"/></Button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-slate-800 line-clamp-2">{mat.title}</h3>
                                <div className="text-sm text-slate-400 mb-6 flex-grow line-clamp-3">
                                    {Array.isArray(mat.content) && mat.content.find((c: any) => c.type === 'text')?.content ? mat.content.find((c: any) => c.type === 'text').content : "Kosong."}
                                </div>
                                <div className="mt-auto flex gap-2">
                                    <Button onClick={() => openMaterialDialog(mat)} variant="outline" className="flex-1 h-11 font-bold border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl"><Edit2 className="w-4 h-4 mr-2"/> Edit Materi</Button>
                                    <Button onClick={() => confirmDelete(mat, "material")} variant="outline" size="icon" className="h-11 w-11 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl shrink-0"><Trash2 className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 4. QUIZ EDITOR --- */}
            {activeMenu === "quiz" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[32px] font-bold text-slate-800 tracking-tight">Quiz Editor</h1>
                        <p className="text-slate-400 text-sm">Atur pertanyaan, opsi, dan kunci jawaban untuk kuis.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT: LIST */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] overflow-hidden">
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pilih Level Quiz</Label>
                                        <Select onValueChange={setSelectedQuizId} value={selectedQuizId}>
                                            <SelectTrigger className="font-bold h-12 rounded-xl bg-[#f8f9fa] border-transparent focus:border-indigo-200 focus:bg-white"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                            <SelectContent>{quizzes.map((q) => (<SelectItem key={q.id} value={q.id} className="font-bold">{q.level} - {q.title}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {selectedQuizId && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Daftar Soal</Label>
                                                <span className="text-xs font-bold text-slate-400">{quizQuestions.length} Soal</span>
                                            </div>
                                            <Button variant="outline" className="w-full justify-start text-slate-600 border-dashed border-2 hover:bg-slate-50 h-12 rounded-xl font-bold bg-white" onClick={() => {
                                                setEditingQuestion(null); setQuizQuestionText(""); setQuizExplanation(""); setQuizOptions(["","",""]); setQuizCorrectOption(""); setQuizBlankAnswer(""); setQuizReorderSentence("");
                                            }}>
                                                <Plus className="w-4 h-4 mr-2"/> Tambah Soal Baru
                                            </Button>
                                            
                                            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                                {quizQuestions.map((q, idx) => (
                                                    <div key={q.id} className={cn("p-4 rounded-xl transition-all cursor-pointer group flex flex-col gap-3", editingQuestion?.id === q.id ? "bg-indigo-50 border-transparent shadow-none" : "bg-white border border-slate-100 hover:border-slate-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)]")} onClick={() => loadQuestionForEdit(q)}>
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className={cn("flex-1 text-sm line-clamp-2 leading-relaxed", editingQuestion?.id === q.id ? "font-bold text-indigo-900" : "font-medium text-slate-600")}><span className={cn("mr-2 px-1.5 py-0.5 rounded-lg text-[10px] font-bold", editingQuestion?.id === q.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400")}>#{q.order_index}</span>{q.question}</div>
                                                        </div>
                                                        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                                            <Badge variant="outline" className="text-[9px] uppercase bg-transparent text-slate-400 font-bold tracking-wider border-none shadow-none px-0">{q.type.replace("-", " ")}</Badge>
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-slate-700" onClick={(e) => {e.stopPropagation(); handleMoveQuizQuestion(q, 'up')}}><ArrowUp className="w-3 h-3"/></Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-slate-700" onClick={(e) => {e.stopPropagation(); handleMoveQuizQuestion(q, 'down')}}><ArrowDown className="w-3 h-3"/></Button>
                                                                <div className="w-px h-4 bg-slate-200 mx-1 self-center"></div>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500 shrink-0" onClick={(e) => {e.stopPropagation(); confirmDelete(q, "quiz_question")}}><Trash2 className="w-3 h-3"/></Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT: EDITOR */}
                        <div className="lg:col-span-8">
                            <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] h-fit overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex flex-row justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-800">{editingQuestion ? `Edit Soal #${editingQuestion.order_index}` : "Area Kerja Soal"}</h2>
                                    {editingQuestion && <Badge className="bg-amber-100 text-amber-700 shadow-none border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">Mode Edit</Badge>}
                                </div>
                                <CardContent className="p-8">
                                    {!selectedQuizId ? (
                                        <div className="text-center py-20 text-slate-400 font-medium flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[#f8f9fa] rounded-2xl flex items-center justify-center mb-4"><PenTool className="w-6 h-6 text-slate-300"/></div>
                                            <p>Pilih Level Quiz di panel kiri untuk mulai membuat soal.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSaveQuizQuestion} className="space-y-8">
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pertanyaan</Label>
                                                <Textarea placeholder="Misal: Translate 'Apple' to German..." value={quizQuestionText} onChange={e => setQuizQuestionText(e.target.value)} required className="font-bold min-h-[120px] text-lg rounded-2xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white transition-colors p-5" />
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipe Jawaban</Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {["multiple-choice", "fill-blank", "reorder"].map((type) => (
                                                        <div key={type} onClick={() => setQuizType(type as any)} className={cn("cursor-pointer px-6 py-3 rounded-2xl border-2 font-bold text-sm capitalize transition-all", quizType === type ? 'bg-white text-indigo-600 border-indigo-600 shadow-[0_4px_20px_rgb(79,70,229,0.12)]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300')}>
                                                            {type.replace("-", " ")}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="p-8 bg-[#f8f9fa] rounded-[2rem] space-y-6">
                                                {quizType === "multiple-choice" && (
                                                    <>
                                                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">Opsi Pilihan Ganda</Label>
                                                        <div className="space-y-3">
                                                            {quizOptions.map((opt, idx) => (
                                                                <div key={idx} className="flex gap-3 items-center group">
                                                                    <div className="w-12 h-12 flex items-center justify-center font-bold bg-white border border-slate-100 rounded-xl text-slate-400 shrink-0 shadow-sm">{String.fromCharCode(65 + idx)}</div>
                                                                    <Input value={opt} onChange={(e) => {const newOpts = [...quizOptions]; newOpts[idx] = e.target.value; setQuizOptions(newOpts);}} placeholder={`Teks opsi...`} className="h-12 rounded-xl bg-white border-slate-100 font-medium shadow-sm focus:border-indigo-200" />
                                                                    {quizOptions.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => setQuizOptions(quizOptions.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 h-12 w-12 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></Button>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed border-2 text-slate-400 hover:bg-white hover:text-slate-700 font-bold mt-2" onClick={() => setQuizOptions([...quizOptions, ""])}><Plus className="w-4 h-4 mr-2"/> Tambah Opsi</Button>
                                                        
                                                        <div className="pt-6 mt-6 space-y-3">
                                                            <Label className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14}/> Set Kunci Jawaban</Label>
                                                            <Select onValueChange={setQuizCorrectOption} value={quizCorrectOption}>
                                                                <SelectTrigger className="bg-white border-emerald-100 h-12 rounded-xl font-bold text-emerald-700 shadow-sm"><SelectValue placeholder="Pilih yang benar..." /></SelectTrigger>
                                                                <SelectContent>{quizOptions.filter(o => o).map(o => <SelectItem key={o} value={o} className="font-bold">{o}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </div>
                                                    </>
                                                )}
                                                {quizType === "fill-blank" && (
                                                    <div className="space-y-3">
                                                        <Label className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14}/> Jawaban Persis (1 Kata)</Label>
                                                        <Input value={quizBlankAnswer} onChange={e => setQuizBlankAnswer(e.target.value)} placeholder="Misal: Katze" className="bg-white h-12 rounded-xl border-emerald-100 font-bold text-lg shadow-sm text-emerald-700 focus:border-emerald-300"/>
                                                    </div>
                                                )}
                                                {quizType === "reorder" && (
                                                    <div className="space-y-3">
                                                        <Label className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14}/> Kalimat Benar (Pisahkan dgn Koma)</Label>
                                                        <Textarea value={quizReorderSentence} onChange={e => setQuizReorderSentence(e.target.value)} placeholder="Misal: Ich, gehe, heute, ins, Kino" className="bg-white min-h-[100px] rounded-xl border-emerald-100 font-bold text-lg shadow-sm text-emerald-700 p-4 focus:border-emerald-300"/>
                                                        <p className="text-[11px] text-slate-400 mt-2 font-medium">Sistem akan mengacak kata-kata ini secara otomatis.</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Lightbulb size={14}/> Penjelasan (Opsional)</Label>
                                                <Textarea value={quizExplanation} onChange={e => setQuizExplanation(e.target.value)} placeholder="Jelaskan mengapa jawaban ini benar..." className="min-h-[100px] rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 p-5 font-medium"/>
                                            </div>
                                            
                                            <div className="flex gap-4 pt-6">
                                                {editingQuestion && <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-slate-200 text-slate-500" onClick={() => {setEditingQuestion(null); setQuizQuestionText(""); setQuizExplanation("");}}>Batal Edit</Button>}
                                                <Button type="submit" disabled={isUploading} className="flex-2 w-full h-14 font-bold text-base bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-sm">{isUploading ? <Loader2 className="animate-spin mr-2"/> : "Simpan Soal"}</Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 5. PROGRAM STUDI --- */}
            {activeMenu === "program" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* 1. HEADER SECTION */}
                    <div className="space-y-2">
                        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Program Studi</h1>
                        <p className="text-slate-500 text-sm">Lihat dan kelola semua kategori program studi di berbagai bidang. Gunakan filter untuk mencari program spesifik.</p>
                    </div>

                    {/* 2. STATS ROW (Clean Style) */}
                    <div className="flex flex-wrap gap-12 py-6 border-y border-slate-100">
                        <div>
                            <p className="text-slate-500 text-[13px] font-medium mb-1">Total Program</p>
                            <p className="text-3xl font-bold text-slate-900">{programs.length}</p>
                        </div>
                        <div className="border-l border-slate-100 pl-12">
                            <p className="text-slate-500 text-[13px] font-medium mb-1">Umum</p>
                            <p className="text-3xl font-bold text-indigo-600">{totalGeneral}</p>
                        </div>
                        <div className="border-l border-slate-100 pl-12">
                            <p className="text-slate-500 text-[13px] font-medium mb-1">Ausbildung</p>
                            <p className="text-3xl font-bold text-emerald-600">{totalAusbildung}</p>
                        </div>
                        <div className="border-l border-slate-100 pl-12">
                            <p className="text-slate-500 text-[13px] font-medium mb-1">Hasil Pencarian</p>
                            <p className="text-3xl font-bold text-amber-500">{filteredPrograms.length}</p>
                        </div>
                    </div>

                    {/* 3. FILTER PANEL (The "Manage Questions" Look) */}
                    <Card className="p-8 border-slate-200 shadow-sm bg-white rounded-xl">
                        {/* HEADER SECTION: Sekarang tombol dipindah ke sini dan dibuat sejajar (flex) */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                                <p className="text-slate-400 text-[13px]">Persempit hasil pencarian Anda dengan menerapkan filter di bawah ini</p>
                            </div>
                            
                            {/* Tombol Tambah Program - Sekarang berada di kanan atas sejajar dengan judul */}
                            <Button onClick={() => openProgramDialog(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-lg shrink-0">
                                <Plus className="w-4 h-4 mr-2"/> Tambah Program Baru
                            </Button>
                        </div>

                        {/* GRID INPUT - Tetap sama seperti kodemu sebelumnya */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Search Input */}
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold text-slate-700">Cari Nama Program</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                    <Input 
                                        placeholder="e.g., Perawat, IT..." 
                                        className="pl-10 h-11 border-slate-200 focus:ring-0 focus:border-slate-900"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold text-slate-700">Tipe Program</Label>
                                <Select value={programFilter} onValueChange={(val: any) => {setProgramFilter(val); setCategoryFilter("all");}}>
                                    <SelectTrigger className="h-11 border-slate-200">
                                        <SelectValue placeholder="Semua Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        <SelectItem value="general">Umum</SelectItem>
                                        <SelectItem value="ausbildung">Ausbildung</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold text-slate-700">Bidang / Kategori</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="h-11 border-slate-200">
                                        <SelectValue placeholder="Semua Bidang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Bidang</SelectItem>
                                        {categoryList.map(cat => (
                                            <SelectItem key={cat} value={cat}>{defaultCategoryLabels[cat] || cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 flex flex-col justify-end pb-1">
                                <p className="text-[11px] text-slate-400 italic">Menampilkan {filteredPrograms.length} dari {programs.length} data tersedia.</p>
                            </div>
                        </div>
                        
                        {/* Bagian bawah (Filter Actions) dihapus karena tombol sudah pindah ke atas */}
                    </Card>

                    {/* 4. RESULTS TABLE / GRID */}
                    <div className="space-y-4">
                        {filteredPrograms.length === 0 ? (
                            <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">Tidak ada program yang sesuai dengan filter Anda.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPrograms.map((prog) => (
                                    <div key={prog.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase text-slate-400 border-slate-200">
                                                {prog.category}
                                            </Badge>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => openProgramDialog(prog)}><Edit2 size={14}/></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => confirmDelete(prog, "program")}><Trash2 size={14}/></Button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{prog.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{prog.description}</p>
                                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gaji</p>
                                                <p className="text-xs font-bold text-slate-700">{prog.salary || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Durasi</p>
                                                <p className="text-xs font-bold text-slate-700">{prog.duration || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- 6. PENGUMUMAN --- */}
            {activeMenu === "announcement" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[32px] font-bold text-slate-800 tracking-tight">Pengumuman</h1>
                        <p className="text-slate-400 text-sm">Buat pop-up atau banner berjalan untuk users.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <button onClick={() => openAnnouncementDialog(null)} className="h-auto min-h-[220px] rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-white transition-all flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 gap-4 group">
                            <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Plus className="w-6 h-6"/></div>
                            <span className="font-bold">Buat Baru</span>
                        </button>

                        {announcements.map((ann) => (
                            <div key={ann.id} className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-[2rem] p-8 flex flex-col h-full min-h-[220px] relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className={cn("font-bold uppercase text-[9px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-none border", ann.type === 'popup' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-sky-50 text-sky-700 border-sky-100")}>
                                            {ann.type === 'popup' ? <BellRing className="w-3 h-3"/> : <MoveHorizontal className="w-3 h-3"/>} {ann.type}
                                        </Badge>
                                        <Badge variant="outline" className={cn("font-bold uppercase text-[9px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-none border", ann.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200")}>
                                            {ann.is_active ? <CheckCircle2 className="w-3 h-3"/> : <LogOut className="w-3 h-3"/>} {ann.is_active ? "Aktif" : "Draft"}
                                        </Badge>
                                    </div>
                                </div>

                                <h3 className="font-bold text-xl mb-3 text-slate-800 line-clamp-2">{ann.title}</h3>
                                
                                <div className="text-sm text-slate-400 mb-6 flex-grow font-medium">
                                    {Array.isArray(ann.content) && ann.content.length > 0 ? `${ann.content.length} Blok Konten` : "Kosong"}
                                </div>

                                <div className="mt-auto flex gap-2">
                                    <Button onClick={() => openAnnouncementDialog(ann)} variant="outline" className="flex-1 h-11 font-bold border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl"><Edit2 className="w-4 h-4 mr-2"/> Edit</Button>
                                    <Button onClick={() => confirmDelete(ann, "announcement")} variant="outline" size="icon" className="h-11 w-11 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl shrink-0"><Trash2 className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 7. IMPORT JSON --- */}
            {activeMenu === "import" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[32px] font-bold text-slate-800 tracking-tight">Import JSON</h1>
                        <p className="text-slate-400 text-sm">Upload data massal melalui format JSON baku.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-1 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] h-fit">
                            <div className="p-8 border-b border-slate-50">
                                <h2 className="text-xl font-bold text-slate-800">Target Import</h2>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipe Data</Label>
                                    <Select value={importType} onValueChange={(val: any) => setImportType(val)}>
                                        <SelectTrigger className="font-bold h-12 rounded-xl bg-[#f8f9fa] border-transparent focus:border-indigo-200 focus:bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="vocab" className="font-bold">Kosakata & Bab</SelectItem>
                                            <SelectItem value="material" className="font-bold">Materi Bacaan</SelectItem>
                                            <SelectItem value="quiz" className="font-bold">Quiz / Soal</SelectItem>
                                            <SelectItem value="program" className="font-bold">Program Studi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Format Wajib (Template)</Label>
                                    <div className="bg-slate-900 p-6 rounded-2xl text-xs font-mono text-emerald-400 overflow-auto max-h-[300px] custom-scrollbar shadow-inner">
                                        <pre className="whitespace-pre-wrap break-words">{getPlaceholder()}</pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] flex flex-col overflow-hidden h-fit">
                            <div className="p-8 border-b border-slate-50">
                                <h2 className="text-xl font-bold text-slate-800">JSON Editor</h2>
                            </div>
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <Textarea className="flex-1 min-h-[400px] lg:min-h-[500px] border-0 rounded-none p-8 font-mono text-[13px] focus-visible:ring-0 bg-transparent resize-none leading-relaxed" placeholder="// Paste JSON-mu di sini..." value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} spellCheck={false} />
                                <div className="p-8 border-t border-slate-50 bg-[#f8f9fa] flex justify-end">
                                    <Button onClick={handleSmartImport} disabled={isUploading || !jsonInput} className="font-bold bg-slate-900 text-white hover:bg-slate-800 h-12 px-8 rounded-xl w-full sm:w-auto shadow-sm">
                                        {isUploading ? <Loader2 className="animate-spin w-5 h-5 mr-2"/> : <UploadCloud className="w-5 h-5 mr-2"/>} Eksekusi Import
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            
          </div>
        </div>
      </main>

      {/* --- ALL DIALOGS (MODALS) --- */}

      {/* 1. DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
         <DialogContent className="max-w-xs rounded-[2rem] p-8 border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.08)] bg-white">
            <div className="flex flex-col items-center text-center gap-5 py-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center animate-pulse"><AlertTriangle size={32} strokeWidth={2}/></div>
                <div className="space-y-1.5">
                  <DialogTitle className="text-xl font-bold text-slate-800">Hapus Data?</DialogTitle>
                  <DialogDescription className="text-sm font-medium text-slate-400">Data tidak bisa dikembalikan lagi.</DialogDescription>
                </div>
            </div>
            <DialogFooter className="flex flex-col gap-2 p-0 sm:flex-col">
                <Button variant="destructive" className="w-full h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 shadow-sm" onClick={performDelete} disabled={isUploading}>{isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Ya, Hapus"}</Button>
                <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-slate-400 hover:text-slate-700" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* 2. GENERAL EDIT DIALOG (VOCAB, LESSON, DIALOG, EXERCISE) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md h-auto p-0 overflow-hidden border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.08)] rounded-[2rem] bg-white max-h-[85vh] flex flex-col">
            <DialogHeader className="p-8 border-b border-slate-50 flex-row items-center justify-between shrink-0">
                <DialogTitle className="text-xl font-bold text-slate-800">{editingItem ? "Edit Data" : "Tambah Baru"}</DialogTitle>
                <Badge className="bg-[#f8f9fa] text-slate-400 font-bold text-[10px] uppercase border-none tracking-widest px-3 py-1 rounded-lg">{formType}</Badge>
            </DialogHeader>
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                {formType === "vocab" && (
                  <div className="space-y-5">
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kata Jerman</Label><Input value={formData.german} onChange={e => setFormData({...formData, german: e.target.value})} className="h-12 font-bold rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white" placeholder="Contoh: der Apfel"/></div>
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Arti Indonesia</Label><Input value={formData.indonesian} onChange={e => setFormData({...formData, indonesian: e.target.value})} className="h-12 font-bold rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white" placeholder="Contoh: Apel"/></div>
                      <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kategori</Label>
                          <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                              <SelectTrigger className="h-12 font-bold rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white"><SelectValue placeholder="Pilih..."/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="noun" className="font-bold">Nomen (Kata Benda)</SelectItem>
                                  <SelectItem value="verb" className="font-bold">Verb (Kata Kerja)</SelectItem>
                                  <SelectItem value="adjective" className="font-bold">Adjektiv (Kata Sifat)</SelectItem>
                                  <SelectItem value="phrase" className="font-bold">Frasa</SelectItem>
                                  <SelectItem value="adverb" className="font-bold">Adverb</SelectItem>
                                  <SelectItem value="other" className="font-bold">Lainnya</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contoh Kalimat</Label><Textarea value={formData.example} onChange={e => setFormData({...formData, example: e.target.value})} className="min-h-[100px] border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white rounded-xl font-medium p-4" placeholder="Ich esse den Apfel..."/></div>
                  </div>
                )}
                {formType === "lesson" && (
                  <div className="space-y-5">
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Judul Bab</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-12 font-bold rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white" placeholder="Contoh: Dasar Perkenalan"/></div>
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Slug (ID Unik)</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="h-12 font-mono text-sm rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white" placeholder="perkenalan-a1"/></div>
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Urutan</Label><Input type="number" value={formData.order_index} onChange={e => setFormData({...formData, order_index: e.target.value ? parseInt(e.target.value) : 0})} className="h-12 font-bold rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white" /></div>
                  </div>
                )}
                {formType === "dialog" && (
                    <div className="space-y-5">
                        <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Judul Dialog</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-12 font-bold rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white"/></div>
                        <div className="space-y-3">
                            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Isi Dialog</Label>
                            <div className="space-y-4">
                                {formData.dialog_lines.map((line, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 p-5 border border-slate-100 rounded-[1.5rem] bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative group">
                                        <div className="flex gap-3 items-center justify-between">
                                            <div className="flex gap-2 items-center">
                                                <Badge className="bg-[#f8f9fa] text-slate-500 shadow-none border-none font-bold text-xs w-8 h-8 flex justify-center p-0 rounded-lg">#{idx+1}</Badge>
                                                <Input className="w-24 h-10 text-xs font-bold bg-[#f8f9fa] border-transparent focus:border-indigo-200 focus:bg-white rounded-xl text-center" placeholder="Speaker" value={line.speaker} onChange={e => { const newLines = [...formData.dialog_lines]; newLines[idx].speaker = e.target.value; setFormData({...formData, dialog_lines: newLines}); }} />
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => { const newLines = formData.dialog_lines.filter((_, i) => i !== idx); setFormData({...formData, dialog_lines: newLines}); }}><Trash2 className="w-4 h-4"/></Button>
                                        </div>
                                        <Textarea className="text-sm min-h-[60px] bg-[#f8f9fa] border-transparent focus:border-indigo-200 focus:bg-white rounded-xl font-medium p-4" placeholder="Teks Jerman..." value={line.german} onChange={e => { const newLines = [...formData.dialog_lines]; newLines[idx].german = e.target.value; setFormData({...formData, dialog_lines: newLines}); }} />
                                        <Input className="h-10 text-xs bg-[#f8f9fa] border-transparent focus:border-indigo-200 focus:bg-white rounded-xl px-4" placeholder="Terjemahan Indo (Opsional)" value={line.indonesian || ""} onChange={e => { const newLines = [...formData.dialog_lines]; newLines[idx].indonesian = e.target.value; setFormData({...formData, dialog_lines: newLines}); }} />
                                    </div>
                                ))}
                            </div>
                            <Button size="sm" variant="outline" className="w-full h-12 rounded-2xl text-xs font-bold border-dashed border-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 mt-2 bg-transparent" onClick={() => setFormData({...formData, dialog_lines: [...formData.dialog_lines, {speaker: "A", german: "", indonesian: ""}]})}><Plus className="w-4 h-4 mr-2"/> Tambah Baris Dialog</Button>
                        </div>
                    </div>
                )}
                {formType === "exercise" && (
                    <div className="space-y-8">
                        <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pertanyaan</Label><Textarea value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="font-bold min-h-[100px] rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white p-5" placeholder="Soal latihan..."/></div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Opsi Jawaban</Label>
                           {formData.options.map((opt, i) => (
                               <div key={i} className="flex items-center gap-3">
                                   <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">{String.fromCharCode(65+i)}</div>
                                   <Input value={opt} onChange={e => { const newOpts = [...formData.options]; newOpts[i] = e.target.value; setFormData({...formData, options: newOpts}); }} placeholder={`Opsi ${String.fromCharCode(65+i)}`} className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:border-indigo-200 focus:bg-white font-medium" />
                               </div>
                           ))}
                        </div>
                        <div className="space-y-2 pt-6 mt-6 border-t border-slate-50">
                            <Label className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14}/> Kunci Jawaban</Label>
                            <Select value={String(formData.correct_answer_idx)} onValueChange={(val) => setFormData({...formData, correct_answer_idx: val})}>
                                <SelectTrigger className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-emerald-200 font-bold text-emerald-700"><SelectValue placeholder="Pilih yang benar..." /></SelectTrigger>
                                <SelectContent>
                                    {formData.options.map((opt, i) => (
                                        <SelectItem key={i} value={String(i)} className="font-bold">
                                            <span className="mr-2 text-emerald-600">{String.fromCharCode(65+i)}:</span> {opt || `(Kosong)`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter className="p-8 border-t border-slate-50 flex-row gap-3 shrink-0">
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="flex-1 font-bold h-12 rounded-xl text-slate-400 hover:bg-[#f8f9fa] hover:text-slate-700">Batal</Button>
                <Button onClick={handleSave} disabled={isUploading} className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 font-bold rounded-xl text-white shadow-sm">{isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Simpan Data"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. MATERIAL EDITOR DIALOG (VISUAL BLOCK) */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.08)] bg-white">
              <DialogHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between shrink-0">
                  <DialogTitle className="flex items-center gap-2 font-bold text-xl text-slate-800">Visual Editor</DialogTitle>
                  <DialogDescription className="hidden">Editor</DialogDescription>
                  <Button variant="ghost" size="icon" onClick={() => setMaterialDialogOpen(false)} className="rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"><X size={20}/></Button>
              </DialogHeader>
              
              <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
                  {/* LEFT: Config */}
                  <div className="w-full md:w-[350px] bg-white p-8 border-b md:border-b-0 md:border-r border-slate-50 space-y-8 shrink-0 overflow-y-auto custom-scrollbar">
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Judul Materi</Label><Input value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="font-bold h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" placeholder="Contoh: Alfabet"/></div>
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID Section (Unik)</Label><Input value={materialForm.section_id} onChange={e => setMaterialForm({...materialForm, section_id: e.target.value})} className="font-mono text-sm h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" placeholder="a1_1_intro"/></div>
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status Materi</Label>
                            <Select value={materialForm.status} onValueChange={(val) => setMaterialForm({...materialForm, status: val})}>
                                <SelectTrigger className="h-12 rounded-xl font-bold border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft" className="font-bold text-slate-500">📄 Draft</SelectItem>
                                    <SelectItem value="review" className="font-bold text-amber-600">⏳ In Review</SelectItem>
                                    <SelectItem value="published" className="font-bold text-emerald-600">🌐 Published</SelectItem>
                                    <SelectItem value="rejected" className="font-bold text-red-600">❌ Rejected</SelectItem>
                                    <SelectItem value="archived" className="font-bold text-slate-400">🗄️ Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Urutan</Label><Input type="number" value={materialForm.order_index} onChange={e => setMaterialForm({...materialForm, order_index: parseInt(e.target.value)})} className="h-12 rounded-xl font-bold border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" /></div>
                          <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Level</Label><Select value={materialForm.level_id} onValueChange={(val) => setMaterialForm({...materialForm, level_id: val})}><SelectTrigger className="h-12 rounded-xl font-bold border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200"><SelectValue /></SelectTrigger><SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id} className="font-bold">{l.id}</SelectItem>)}</SelectContent></Select></div>
                      </div>
                      
                      {/* TIPS EDITOR */}
                      <div className="border-t border-slate-50 pt-8 space-y-3">
                           <Label className="text-[11px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5"/> Tips (Baris baru = Poin baru)</Label>
                           <Textarea value={materialForm.tips} onChange={(e) => setMaterialForm({...materialForm, tips: e.target.value})} placeholder="Tip 1...&#10;Tip 2..." className="bg-amber-50/50 border-transparent focus:border-amber-200 focus:bg-white text-sm font-medium min-h-[120px] rounded-xl p-5" />
                      </div>

                      {/* RESOURCES EDITOR */}
                      <div className="border-t border-slate-50 pt-8 space-y-4">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><LinkIcon size={14}/> Referensi (Link)</Label>
                        <div className="space-y-4">
                            {materialForm.resources.map((res, idx) => (
                               <div key={idx} className="p-5 bg-[#f8f9fa] rounded-[1.5rem] border border-transparent hover:border-slate-200 transition-colors space-y-4 relative group">
                                 <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-white rounded-xl" onClick={() => {const r = materialForm.resources.filter((_, i) => i !== idx); setMaterialForm({...materialForm, resources: r})}}><Trash2 className="w-4 h-4"/></Button>
                                 <div className="flex gap-3 pr-8">
                                     <div className="flex-1 space-y-1.5">
                                         <Label className="text-[9px] text-slate-400 font-bold uppercase">Judul</Label>
                                         <Input placeholder="Contoh: Video" className="text-xs h-10 rounded-xl border-slate-100 font-bold bg-white" value={res.title} onChange={e => {const r = [...materialForm.resources]; r[idx].title = e.target.value; setMaterialForm({...materialForm, resources: r})}} />
                                     </div>
                                     <div className="w-[45%] space-y-1.5">
                                         <Label className="text-[9px] text-slate-400 font-bold uppercase">Tipe</Label>
                                         <Select value={res.type} onValueChange={(val) => {const r = [...materialForm.resources]; r[idx].type = val; setMaterialForm({...materialForm, resources: r})}}>
                                              <SelectTrigger className="h-10 text-xs font-bold rounded-xl border-slate-100 bg-white"><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="web">🌐 Web</SelectItem>
                                                  <SelectItem value="pdf">📄 PDF</SelectItem>
                                                  <SelectItem value="video">🎥 Video</SelectItem>
                                                  <SelectItem value="audio">🎧 Audio</SelectItem>
                                              </SelectContent>
                                         </Select>
                                     </div>
                                 </div>
                                 <div className="space-y-1.5">
                                     <Label className="text-[9px] text-slate-400 font-bold uppercase">URL Destination</Label>
                                     <Input placeholder="https://..." className="text-xs h-10 rounded-xl border-slate-100 bg-white" value={res.url} onChange={e => {const r = [...materialForm.resources]; r[idx].url = e.target.value; setMaterialForm({...materialForm, resources: r})}} />
                                 </div>
                               </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full h-12 text-xs font-bold border-dashed border-2 rounded-xl text-slate-400 hover:border-indigo-200 hover:text-indigo-600 bg-transparent" onClick={() => setMaterialForm({...materialForm, resources: [...materialForm.resources, {title: "", url: "", type: "web"}]})}><Plus className="w-4 h-4 mr-2"/> Tambah Link Referensi</Button>
                      </div>
                  </div>
                  
                  {/* RIGHT: Canvas */}
                  <div className="flex-1 bg-[#f8f9fa] p-8 md:p-12 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
                      {materialForm.content.length === 0 && (
                          <div className="text-center text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center h-[300px] mt-10">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm"><LayoutDashboard className="w-8 h-8 text-slate-300"/></div>
                              <p className="text-slate-700 font-bold text-lg">Canvas Kosong</p>
                              <p className="text-sm mt-1">Gunakan toolbar di bawah untuk menambah teks, list, atau gambar.</p>
                          </div>
                      )}
                      
                      {materialForm.content.map((block, idx) => (
                          <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative group animate-in slide-in-from-bottom-4 duration-500">
                              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                                  <Badge className="bg-[#f8f9fa] text-slate-500 shadow-none border-none uppercase tracking-widest text-[9px] font-bold px-3 py-1.5 rounded-lg">
                                      {block.type === 'text' ? 'Paragraf Teks' : block.type === 'list' ? 'Daftar Poin' : block.type === 'image' ? 'Gambar/Media' : 'Tabel Data'}
                                  </Badge>
                                  <div className="flex items-center gap-1 bg-[#f8f9fa] p-1 rounded-xl">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white" onClick={() => handleMoveContentBlock(idx, 'up')} disabled={idx === 0}><ArrowUp className="w-4 h-4"/></Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white" onClick={() => handleMoveContentBlock(idx, 'down')} disabled={idx === materialForm.content.length - 1}><ArrowDown className="w-4 h-4"/></Button>
                                      <div className="w-px h-5 bg-slate-200 mx-1"></div>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white" onClick={() => removeContentBlock(idx)}><Trash2 className="w-4 h-4"/></Button>
                                  </div>
                              </div>
                              
                              {block.type === 'text' && (
                                  <div className="space-y-3">
                                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Isi Paragraf</Label>
                                      <Textarea value={block.content} onChange={(e) => updateContentBlock(idx, "content", e.target.value)} placeholder="Tulis paragraf di sini..." className="min-h-[150px] border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 rounded-2xl text-base leading-relaxed p-6" />
                                  </div>
                              )}
                              {block.type === 'list' && (
                                  <div className="space-y-3">
                                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Daftar Poin (1 baris = 1 poin)</Label>
                                      <Textarea value={block.items?.join("\n")} onChange={(e) => updateContentBlock(idx, "items_raw", e.target.value)} placeholder="Poin pertama&#10;Poin kedua" className="min-h-[150px] border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 rounded-2xl font-medium p-6" />
                                  </div>
                              )}
                              {block.type === 'image' && (
                                  <div className="flex flex-col sm:flex-row gap-8">
                                      <div className="flex-1 space-y-5">
                                          <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">URL Gambar</Label><Input value={block.src} onChange={(e) => updateContentBlock(idx, "src", e.target.value)} placeholder="https://..." className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" /></div>
                                          <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Deskripsi (Alt Text)</Label><Input value={block.alt} onChange={(e) => updateContentBlock(idx, "alt", e.target.value)} placeholder="Keterangan..." className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" /></div>
                                      </div>
                                      {block.src && (
                                          <div className="w-full sm:w-48 h-48 bg-[#f8f9fa] rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                              <img src={block.src} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                          </div>
                                      )}
                                  </div>
                              )}
                              {block.type === 'table' && (
                                  <div className="space-y-3">
                                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Format CSV (Pemisah koma)</Label>
                                      <Textarea defaultValue={getTableAsCSV(block)} onBlur={(e) => updateContentBlock(idx, "csv_raw", e.target.value)} placeholder="Header 1, Header 2&#10;Data A, Data B" className="min-h-[150px] font-mono text-sm bg-slate-900 text-emerald-400 rounded-2xl p-6 border-none" />
                                  </div>
                              )}
                          </div>
                      ))}

                      {/* FLOATING TOOLBAR */}
                      <div className="sticky bottom-0 mt-10 w-full flex justify-center pb-8 pt-4 pointer-events-none z-20">
                          <div className="bg-white/90 backdrop-blur-xl p-2.5 rounded-[1.5rem] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 flex gap-2 pointer-events-auto">
                              <Button variant="ghost" onClick={() => addContentBlock('text')} className="h-12 px-5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 font-bold text-slate-500"><AlignLeft className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">Teks</span></Button>
                              <div className="w-px bg-slate-100 my-2"></div>
                              <Button variant="ghost" onClick={() => addContentBlock('list')} className="h-12 px-5 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 font-bold text-slate-500"><List className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">List</span></Button>
                              <div className="w-px bg-slate-100 my-2"></div>
                              <Button variant="ghost" onClick={() => addContentBlock('image')} className="h-12 px-5 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-slate-500"><ImageIcon className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">Gambar</span></Button>
                              <div className="w-px bg-slate-100 my-2"></div>
                              <Button variant="ghost" onClick={() => addContentBlock('table')} className="h-12 px-5 rounded-xl hover:bg-amber-50 hover:text-amber-600 font-bold text-slate-500"><Grid3X3 className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">Tabel</span></Button>
                          </div>
                      </div>
                  </div>
              </div>
              <DialogFooter className="p-8 border-t border-slate-50 flex flex-row items-center justify-end gap-3 shrink-0">
                  <Button variant="ghost" onClick={() => setMaterialDialogOpen(false)} className="font-bold h-12 rounded-xl px-8 text-slate-400 hover:text-slate-700 hover:bg-[#f8f9fa]">Batal</Button>
                  <Button onClick={handleSaveMaterial} disabled={isUploading} className="bg-slate-900 hover:bg-slate-800 font-bold h-12 rounded-xl px-8 text-white shadow-sm">{isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Simpan Materi"}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* 4. PROGRAM EDITOR DIALOG */}
      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.08)] bg-white">
              <DialogHeader className="px-8 py-6 border-b border-slate-50 shrink-0 flex flex-row items-center justify-between">
                  <DialogTitle className="flex items-center gap-2 font-bold text-xl text-slate-800">Editor Program Studi</DialogTitle>
                  <Button variant="ghost" size="icon" onClick={() => setProgramDialogOpen(false)} className="rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"><X size={20}/></Button>
              </DialogHeader>
              
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-12">
                {/* SECTION 1: Basic Info */}
                <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-3">1. Info Dasar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID Program (Unik)</Label><Input value={programForm.id} onChange={e => setProgramForm({...programForm, id: e.target.value})} placeholder="Misal: aupair_de" className="font-mono text-sm h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200"/></div>
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kategori</Label>
                            {isCustomCategory ? (
                                <div className="flex gap-2">
                                    <Input placeholder="Nama kategori baru..." value={programForm.category} onChange={e => setProgramForm({...programForm, category: e.target.value})} className="font-bold text-indigo-600 h-12 rounded-xl bg-white border-indigo-200" />
                                    <Button variant="outline" size="icon" onClick={() => setIsCustomCategory(false)} className="h-12 w-12 rounded-xl border-slate-200"><RotateCcw className="w-4 h-4 text-slate-400"/></Button>
                                </div>
                            ) : (
                                <Select value={categoryList.includes(programForm.category) ? programForm.category : "custom"} onValueChange={(val) => { if(val === "custom") { setIsCustomCategory(true); setProgramForm({...programForm, category: ""}); } else { setProgramForm({...programForm, category: val}); } }}>
                                    <SelectTrigger className="h-12 font-bold rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200"><SelectValue placeholder="Pilih Kategori..." /></SelectTrigger>
                                    <SelectContent>
                                        {categoryList.map(cat => <SelectItem key={cat} value={cat} className="font-bold">{defaultCategoryLabels[cat] || cat}</SelectItem>)}
                                        <SelectItem value="custom" className="text-indigo-600 font-bold border-t border-slate-50 mt-1 pt-2">+ Buat Kategori Baru</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Judul Program</Label><Input value={programForm.title} onChange={e => setProgramForm({...programForm, title: e.target.value})} className="font-bold text-xl h-14 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" placeholder="Contoh: Ausbildung Pflegefachkraft"/></div>
                        <div className="space-y-2 md:col-span-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Deskripsi Detail</Label><Textarea value={programForm.description} onChange={e => setProgramForm({...programForm, description: e.target.value})} className="min-h-[120px] rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 p-5 font-medium" placeholder="Jelaskan detail program..."/></div>
                        <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gaji / Stipend</Label><Input value={programForm.salary} onChange={e => setProgramForm({...programForm, salary: e.target.value})} placeholder="Contoh: €1000/bulan" className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 font-bold text-slate-700"/></div>
                        <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Durasi</Label><Input value={programForm.duration} onChange={e => setProgramForm({...programForm, duration: e.target.value})} placeholder="Contoh: 3 Tahun" className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 font-bold text-slate-700"/></div>
                    </div>
                </div>

                {/* SECTION 2: What You Learn */}
                <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500"/> Apa yang dipelajari?</h3>
                    <div className="grid gap-3">
                        {programForm.what_you_learn.map((item, idx) => (
                            <div key={idx} className="flex gap-3 group">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">{idx+1}</div>
                                <Input value={item} onChange={e => {const arr = [...programForm.what_you_learn]; arr[idx] = e.target.value; setProgramForm({...programForm, what_you_learn: arr})}} placeholder="Poin pembelajaran..." className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 font-medium" />
                                <Button variant="ghost" size="icon" onClick={() => {const arr = [...programForm.what_you_learn]; arr.splice(idx, 1); setProgramForm({...programForm, what_you_learn: arr})}} className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0"><Trash2 className="w-5 h-5"/></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="h-12 rounded-xl border-dashed border-2 text-slate-400 font-bold hover:text-indigo-600 hover:border-indigo-300 w-full sm:w-auto px-8 bg-transparent" onClick={() => setProgramForm({...programForm, what_you_learn: [...programForm.what_you_learn, ""]})}><Plus className="w-4 h-4 mr-2"/> Tambah Poin Pembelajaran</Button>
                </div>

                {/* SECTION 3: Requirements */}
                <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Persyaratan</h3>
                    <div className="space-y-4">
                        {programForm.requirements.map((req, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 border border-slate-100 rounded-2xl bg-[#f8f9fa] relative group">
                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg" onClick={() => {const arr = [...programForm.requirements]; arr.splice(idx, 1); setProgramForm({...programForm, requirements: arr})}}><Trash2 className="w-4 h-4"/></Button>
                                <div className="md:w-1/4 space-y-2">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID Syarat</Label>
                                    <Input className="font-mono text-xs h-11 rounded-xl border-slate-200 bg-white" placeholder="req_usia" value={req.req_id} onChange={e => {const arr = [...programForm.requirements]; arr[idx].req_id = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                                </div>
                                <div className="md:w-1/3 space-y-2">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Label</Label>
                                    <Input className="h-11 rounded-xl border-slate-200 bg-white font-bold" placeholder="Batas Usia" value={req.label} onChange={e => {const arr = [...programForm.requirements]; arr[idx].label = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                                </div>
                                <div className="flex-1 space-y-2 mr-10">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Catatan / Nilai</Label>
                                    <Input className="h-11 rounded-xl border-slate-200 bg-white" placeholder="18 - 26 Tahun" value={req.note} onChange={e => {const arr = [...programForm.requirements]; arr[idx].note = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="h-12 rounded-xl border-dashed border-2 text-slate-400 font-bold hover:text-emerald-600 hover:border-emerald-300 w-full sm:w-auto px-8 bg-transparent" onClick={() => setProgramForm({...programForm, requirements: [...programForm.requirements, { req_id: "", label: "", note: "" }]})}><Plus className="w-4 h-4 mr-2"/> Tambah Syarat</Button>
                </div>

                {/* SECTION 4: External Links */}
                <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-sky-500"/> Link Terkait</h3>
                    <div className="space-y-4">
                        {programForm.links.map((link, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 border border-slate-100 rounded-2xl bg-[#f8f9fa] relative group">
                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg" onClick={() => {const arr = [...programForm.links]; arr.splice(idx, 1); setProgramForm({...programForm, links: arr})}}><Trash2 className="w-4 h-4"/></Button>
                                <div className="md:w-1/4 space-y-2">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nama Link</Label>
                                    <Input className="h-11 rounded-xl border-slate-200 bg-white font-bold" placeholder="Website Resmi" value={link.label} onChange={e => {const arr = [...programForm.links]; arr[idx].label = e.target.value; setProgramForm({...programForm, links: arr})}} />
                                </div>
                                <div className="md:w-1/3 space-y-2">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">URL Tujuan</Label>
                                    <Input className="h-11 rounded-xl border-slate-200 bg-white text-xs font-mono" placeholder="https://..." value={link.url} onChange={e => {const arr = [...programForm.links]; arr[idx].url = e.target.value; setProgramForm({...programForm, links: arr})}} />
                                </div>
                                <div className="flex-1 space-y-2 mr-10">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deskripsi (Opsional)</Label>
                                    <Input className="h-11 rounded-xl border-slate-200 bg-white" placeholder="Info lengkap di sini" value={link.description} onChange={e => {const arr = [...programForm.links]; arr[idx].description = e.target.value; setProgramForm({...programForm, links: arr})}} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="h-12 rounded-xl border-dashed border-2 text-slate-400 font-bold hover:text-sky-600 hover:border-sky-300 w-full sm:w-auto px-8 bg-transparent" onClick={() => setProgramForm({...programForm, links: [...programForm.links, { label: "", url: "", description: "" }]})}><Plus className="w-4 h-4 mr-2"/> Tambah Link Web</Button>
                </div>
              </div>

              <DialogFooter className="p-8 border-t border-slate-50 bg-white flex flex-row items-center justify-end gap-3 shrink-0">
                  <Button variant="ghost" onClick={() => setProgramDialogOpen(false)} className="font-bold h-12 rounded-xl px-8 text-slate-400 hover:text-slate-700 hover:bg-[#f8f9fa]">Batal</Button>
                  <Button onClick={handleSaveProgram} disabled={isUploading} className="bg-slate-900 hover:bg-slate-800 font-bold h-12 rounded-xl px-8 text-white shadow-sm">{isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Simpan Program"}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* 5. ANNOUNCEMENT EDITOR DIALOG */}
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.08)] bg-white">
              <DialogHeader className="px-8 py-6 border-b border-slate-50 shrink-0 flex flex-row items-center justify-between">
                  <DialogTitle className="flex items-center gap-2 font-bold text-xl text-slate-800">Seting Pengumuman</DialogTitle>
                  <Button variant="ghost" size="icon" onClick={() => setAnnouncementDialogOpen(false)} className="rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"><X size={20}/></Button>
              </DialogHeader>
              
              <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
                  {/* LEFT CONFIG */}
                  <div className="w-full md:w-[350px] bg-white p-8 border-b md:border-b-0 md:border-r border-slate-50 space-y-8 shrink-0 overflow-y-auto custom-scrollbar">
                      <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Judul Pengumuman</Label><Input value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} className="font-bold h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" placeholder="Maintenance Sistem"/></div>
                      
                      <div className="space-y-3">
                          <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipe Tampilan</Label>
                          <div className="grid grid-cols-2 gap-3">
                              <div onClick={() => setAnnouncementForm({...announcementForm, type: 'popup'})} className={cn("cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-all", announcementForm.type === 'popup' ? "border-indigo-600 bg-white text-indigo-700 shadow-[0_4px_20px_rgb(79,70,229,0.12)]" : "border-slate-100 bg-[#f8f9fa] hover:bg-white text-slate-400 hover:text-slate-600")}>
                                  <BellRing size={24}/>
                                  <span className="font-bold text-[10px] uppercase tracking-widest">Modal Pop-up</span>
                              </div>
                              <div onClick={() => setAnnouncementForm({...announcementForm, type: 'marquee'})} className={cn("cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-all", announcementForm.type === 'marquee' ? "border-indigo-600 bg-white text-indigo-700 shadow-[0_4px_20px_rgb(79,70,229,0.12)]" : "border-slate-100 bg-[#f8f9fa] hover:bg-white text-slate-400 hover:text-slate-600")}>
                                  <MoveHorizontal size={24}/>
                                  <span className="font-bold text-[10px] uppercase tracking-widest">Teks Berjalan</span>
                              </div>
                          </div>
                      </div>

                      {announcementForm.type === 'marquee' && (
                          <div className="space-y-3 animate-in fade-in duration-300">
                              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Arah Gerak Teks</Label>
                              <div className="flex bg-[#f8f9fa] p-1.5 rounded-2xl">
                                  <Button size="sm" variant="ghost" onClick={() => setAnnouncementForm({...announcementForm, direction: 'left'})} className={cn("flex-1 h-11 rounded-xl font-bold", announcementForm.direction === 'left' ? "bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-slate-800" : "text-slate-400")}><ArrowLeft className="w-4 h-4 mr-2"/> Ke Kiri</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setAnnouncementForm({...announcementForm, direction: 'right'})} className={cn("flex-1 h-11 rounded-xl font-bold", announcementForm.direction === 'right' ? "bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-slate-800" : "text-slate-400")}>Ke Kanan <ArrowLeft className="w-4 h-4 ml-2 rotate-180"/></Button>
                              </div>
                          </div>
                      )}

                      <div className="flex items-center justify-between border-2 border-slate-100 p-5 rounded-2xl bg-white">
                          <div>
                              <Label className="font-bold text-slate-800 text-sm">Status Publish</Label>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Munculkan ke User?</p>
                          </div>
                          <Switch className="data-[state=checked]:bg-emerald-500 shadow-none border-slate-200" checked={announcementForm.is_active} onCheckedChange={(chk) => setAnnouncementForm({...announcementForm, is_active: chk})} />
                      </div>
                  </div>

                  {/* RIGHT CANVAS */}
                  <div className="flex-1 bg-[#f8f9fa] p-8 md:p-12 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
                      {announcementForm.content.length === 0 && (
                          <div className="text-center text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center h-[300px] mt-10">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm"><FileCode className="w-8 h-8 text-slate-300"/></div>
                              <p className="text-slate-700 font-bold text-lg">Isi Pengumuman Kosong</p>
                              <p className="text-sm mt-1">Gunakan toolbar di bawah untuk membuat isi pengumuman.</p>
                          </div>
                      )}

                      {announcementForm.content.map((block, idx) => (
                          <div key={idx} className="bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-[2rem] p-8 relative group animate-in slide-in-from-bottom-4 duration-500">
                              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                                  <Badge className="bg-[#f8f9fa] text-slate-500 shadow-none border-none uppercase tracking-widest text-[9px] font-bold px-3 py-1.5 rounded-lg">Blok {block.type}</Badge>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50" onClick={() => removeAnnounceBlock(idx)}><Trash2 className="w-4 h-4"/></Button>
                              </div>
                              
                              {/* --- RICH TEXT TOOLBAR --- */}
                              {block.type === 'text' && (
                                  <>
                                    <div className="flex gap-1 mb-4 bg-[#f8f9fa] p-1.5 w-fit rounded-xl">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-600 bg-white shadow-sm border border-slate-100" onClick={() => formatAnnounceText(idx, 'b', block.content)}><Bold className="w-4 h-4"/></Button>
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white" onClick={() => formatAnnounceText(idx, 'i', block.content)}><Italic className="w-4 h-4"/></Button>
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white" onClick={() => formatAnnounceText(idx, 'u', block.content)}><Underline className="w-4 h-4"/></Button>
                                        <div className="w-px bg-slate-200 mx-1"></div>
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white" onClick={() => formatAnnounceText(idx, 'a', block.content)}><Link2 className="w-4 h-4"/></Button>
                                    </div>
                                    <Textarea id={`announce-text-${idx}`} value={block.content} onChange={(e) => updateAnnounceBlock(idx, "content", e.target.value)} placeholder="Ketik pengumuman di sini... (Bisa pakai tag HTML untuk link dll)" className="min-h-[150px] rounded-2xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 text-base leading-relaxed p-6" />
                                  </>
                              )}
                              {block.type === 'list' && (<div className="space-y-3"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Daftar Poin (1 baris = 1 poin)</Label><Textarea value={block.items?.join("\n")} onChange={(e) => updateAnnounceBlock(idx, "items_raw", e.target.value)} placeholder="Poin 1&#10;Poin 2" className="min-h-[150px] rounded-2xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200 font-medium p-6" /></div>)}
                              {block.type === 'image' && (
                                  <div className="flex flex-col sm:flex-row gap-8">
                                      <div className="flex-1 space-y-5">
                                          <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">URL Gambar</Label><Input value={block.src} onChange={(e) => updateAnnounceBlock(idx, "src", e.target.value)} placeholder="https://..." className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" /></div>
                                          <div className="space-y-2"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Deskripsi (Alt Text)</Label><Input value={block.alt} onChange={(e) => updateAnnounceBlock(idx, "alt", e.target.value)} placeholder="Keterangan..." className="h-12 rounded-xl border-transparent bg-[#f8f9fa] focus:bg-white focus:border-indigo-200" /></div>
                                      </div>
                                      {block.src && (
                                          <div className="w-full sm:w-48 h-48 bg-[#f8f9fa] rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                              <img src={block.src} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                          </div>
                                      )}
                                  </div>
                              )}
                              {block.type === 'table' && (<div className="space-y-3"><Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Format CSV</Label><Textarea defaultValue={getTableAsCSV(block)} onBlur={(e) => updateAnnounceBlock(idx, "csv_raw", e.target.value)} placeholder="Header 1, Header 2&#10;Data A, Data B" className="min-h-[150px] rounded-2xl border-none bg-slate-900 text-emerald-400 font-mono text-sm p-6" /></div>)}
                          </div>
                      ))}

                      {/* FLOATING TOOLBAR */}
                      <div className="sticky bottom-0 mt-10 w-full flex justify-center pb-8 pt-4 pointer-events-none z-20">
                          <div className="bg-white/90 backdrop-blur-xl p-2.5 rounded-[1.5rem] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 flex gap-2 pointer-events-auto">
                              <Button variant="ghost" onClick={() => addAnnounceBlock('text')} className="h-12 px-5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 font-bold text-slate-500"><AlignLeft className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">Teks</span></Button>
                              <div className="w-px bg-slate-100 my-2"></div>
                              <Button variant="ghost" onClick={() => addAnnounceBlock('list')} className="h-12 px-5 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 font-bold text-slate-500"><List className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">List</span></Button>
                              <div className="w-px bg-slate-100 my-2"></div>
                              <Button variant="ghost" onClick={() => addAnnounceBlock('image')} className="h-12 px-5 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-slate-500"><ImageIcon className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">Gambar</span></Button>
                              <div className="w-px bg-slate-100 my-2"></div>
                              <Button variant="ghost" onClick={() => addAnnounceBlock('table')} className="h-12 px-5 rounded-xl hover:bg-amber-50 hover:text-amber-600 font-bold text-slate-500"><Grid3X3 className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">Tabel</span></Button>
                          </div>
                      </div>
                  </div>
              </div>
              <DialogFooter className="p-8 border-t border-slate-50 bg-white flex flex-row items-center justify-end gap-3 shrink-0">
                  <Button variant="ghost" onClick={() => setAnnouncementDialogOpen(false)} className="font-bold h-12 rounded-xl px-8 text-slate-400 hover:text-slate-700 hover:bg-[#f8f9fa]">Batal</Button>
                  <Button onClick={handleSaveAnnouncement} disabled={isUploading} className="bg-slate-900 hover:bg-slate-800 font-bold h-12 rounded-xl px-8 text-white shadow-sm">{isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Deploy Pengumuman"}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
    </div>
  );
};

// --- HELPER UI COMPONENTS ---

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 mb-1 border outline-none",
      active 
        ? "bg-indigo-50/80 text-indigo-700 border-indigo-100/50" 
        : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    {icon}
    {label}
  </button>
);

const StatCard = ({ title, value, icon, badge, badgeColor, iconBg }: { title: string, value: string | number, icon: any, badge?: string, badgeColor?: string, iconBg: string }) => (
  <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] overflow-hidden">
     <CardContent className="p-8 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-6">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconBg)}>
                {icon}
            </div>
            {badge && (
                <div className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold", badgeColor)}>
                    {badge}
                </div>
            )}
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-[32px] font-black tracking-tight text-slate-800">{value}</p>
        </div>
     </CardContent>
  </Card>
);

export default AdminPage;