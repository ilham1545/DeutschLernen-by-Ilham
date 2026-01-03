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
import { 
  Loader2, UploadCloud, FileJson, LogOut, Plus, Trash2, Edit2, 
  Layers, BookOpen, Crown, BookText, FileCode, LayoutDashboard, Database,
  Menu, X, Home, ArrowLeft, UserCircle, HelpCircle, Save, AlignLeft, List, Grid3X3, Image as ImageIcon, GraduationCap,
  ArrowUp, ArrowDown, Link as LinkIcon, RotateCcw, Search, AlertTriangle, MessageCircle, PenTool, CheckCircle2, Lightbulb, Megaphone, BellRing, MoveHorizontal,
  Bold, Italic, Underline, Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// --- TIPE DATA ---
type Level = { id: string; title: string; description: string };
type Lesson = { id: string; title: string; slug: string; level_id: string; order_index: number };
// UPDATE: Tambah category
type Vocab = { id: string; german: string; indonesian: string; example: string; lesson_id: string; category?: string }; 
type DialogLineDB = { id?: string; speaker: string; german: string; indonesian?: string; order_index: number };
type DialogDB = { id: string; title: string; lesson_id: string; dialog_lines?: DialogLineDB[] }; 
type Exercise = { id: string; question: string; options: string[]; correct_answer: number; lesson_id: string };
type CourseMaterialDB = { id: string; title: string; section_id: string; level_id: string; order_index: number; content: any; resources?: any[]; tips?: string[] };
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
  social: "Sosial & Lingkungan"
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

  // --- DATA ---
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
    german: "", indonesian: "", example: "", category: "noun", // UPDATE: Default category
    explanation: "", examples: "", 
    dialog_lines: [] as { speaker: string, german: string, indonesian: string }[],
    question: "", options: ["", "", "", ""], correct_answer_idx: "0"
  });

  const [materialForm, setMaterialForm] = useState({
    id: "", title: "", section_id: "", level_id: "A1", order_index: 0,
    content: [] as any[],
    resources: [] as { title: string, url: string, type: string }[],
    tips: "" 
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
          // Panggil semua data terkait Bab yang dipilih
          fetchVocabs(selectedLessonId); 
          fetchDialogs(selectedLessonId); 
          fetchExercises(selectedLessonId);
          setIsLoadingData(false);
      } 
  }, [selectedLessonId, activeMenu]); // <- Trigger saat Bab dipilih
  
  useEffect(() => {
      if (selectedQuizId) { fetchQuizQuestions(selectedQuizId); setEditingQuestion(null); setQuizQuestionText(""); setQuizExplanation(""); }
  }, [selectedQuizId]);

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
              tips: tipsStr
          });
      } else {
          setMaterialForm({ id: "", title: "", section_id: "", level_id: selectedLevelId || "A1", order_index: 0, content: [{ type: "text", content: "" }], resources: [], tips: "" });
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

  // --- DELETE FUNCTION (FIXED: STRICT ERROR HANDLING) ---
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

  // --- SAVE FUNCTION (FIXED: STRICT UPDATE CHECK + REALTIME FETCH) ---
  const handleSave = async () => {
    setIsUploading(true);
    try {
      let error = null;

      if (formType === "vocab") {
        if (!selectedLessonId) throw new Error("Pilih Bab dulu!");

        const vocabInput = formData.german.trim();
        
        // Cek Duplikat
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

        // UPDATE: Tambah category ke payload
        const payload = { 
            german: vocabInput, 
            indonesian: formData.indonesian, 
            example: formData.example, 
            lesson_id: selectedLessonId,
            category: formData.category || 'noun' 
        };
        
        if (editingItem) { 
            // FIX: Gunakan .select() untuk memastikan update berhasil
            const { data: updated, error: err } = await supabase.from("vocabularies").update(payload).eq("id", editingItem.id).select(); 
            error = err;
            if (!err && (!updated || updated.length === 0)) throw new Error("Update gagal (RLS atau ID salah).");
        }
        else { 
            const { error: err } = await supabase.from("vocabularies").insert(payload); 
            error = err; 
        }
        
        if (!error) await fetchVocabs(selectedLessonId); // Force await
      
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

  // 2. SAVE MATERIAL
  const handleSaveMaterial = async () => {
      setIsUploading(true);
      try {
          const tipsArray = materialForm.tips.split("\n").filter(t => t.trim() !== "");
          const payload = {
              level_id: materialForm.level_id, section_id: materialForm.section_id, title: materialForm.title,
              order_index: materialForm.order_index, content: materialForm.content, resources: materialForm.resources,
              tips: tipsArray
          };
          let error = null;
          if (editingItem) { const { error: err } = await supabase.from("course_materials").update(payload).eq("id", editingItem.id); error = err; }
          else { const { error: err } = await supabase.from("course_materials").insert(payload); error = err; }
          if (error) throw error;
          toast({ title: "Materi Tersimpan! 📚", description: "Database diperbarui." });
          setMaterialDialogOpen(false); if (selectedLevelId) fetchMaterials(selectedLevelId); fetchStats();
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Simpan", description: err.message }); } finally { setIsUploading(false); }
  };

  // 3. SAVE PROGRAM
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

  // 4. SAVE ANNOUNCEMENT
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

  // 5. SAVE QUIZ
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

  // --- IMPORT JSON (Dengan Placeholder Dinamis) ---
  const handleSmartImport = async () => {
    if (!jsonInput) return;
    setIsUploading(true);
    try {
        const data = JSON.parse(jsonInput);
        if (importType === "vocab") {
            let lessonId;
            const { data: existingLesson } = await supabase.from("lessons").select("id").eq("slug", data.slug).maybeSingle();
            
            if(existingLesson) {
                lessonId = existingLesson.id;
            } else {
                const { data: newLesson, error: createError } = await supabase.from("lessons").insert({
                    level_id: data.level_id,
                    slug: data.slug,
                    title: data.title,
                    order_index: data.order_index || 99
                }).select().single();
                if(createError) throw createError;
                lessonId = newLesson.id;
            }

            if (data.vocabulary?.length) {
                const uniqueVocabs = data.vocabulary.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.german === v.german) === i);
                for (const v of uniqueVocabs) {
                    const { data: exist } = await supabase.from("vocabularies").select("id").eq("german", v.german).maybeSingle();
                    if (!exist) {
                        // UPDATE: Tambah category saat import
                        await supabase.from("vocabularies").insert({ 
                            lesson_id: lessonId, 
                            german: v.german, 
                            indonesian: v.indonesian, 
                            example: v.example,
                            category: v.category || 'noun' 
                        });
                    }
                }
            }

            if (data.dialogs?.length) {
                for (const d of data.dialogs) {
                    const { data: newDialog } = await supabase.from("dialogs").insert({ lesson_id: lessonId, title: d.title }).select().single();
                    if (d.lines?.length && newDialog) {
                        const linesPayload = d.lines.map((l: any, i: number) => ({ 
                            dialog_id: newDialog.id, speaker: l.speaker, german: l.german, indonesian: l.indonesian, order_index: i 
                        }));
                        await supabase.from("dialog_lines").insert(linesPayload);
                    }
                }
            }

            if (data.exercises?.length) {
                const exPayload = data.exercises.map((e: any) => ({
                    lesson_id: lessonId,
                    question: e.question,
                    options: e.options, 
                    correct_answer: e.correct_answer 
                }));
                await supabase.from("exercises").insert(exPayload);
            }

            toast({ title: "Full Import Berhasil", description: `Bab '${data.title}' lengkap dengan Materi & Latihan!` });

        } else if (importType === "material") {
            const { data: existingMat } = await supabase.from("course_materials").select("id").eq("section_id", data.section_id).maybeSingle();
            if (existingMat) {
                await supabase.from("course_materials").update({ 
                    title: data.title, content: data.content, level_id: data.level_id, order_index: data.order_index 
                }).eq("id", existingMat.id);
            } else {
                await supabase.from("course_materials").insert({
                    level_id: data.level_id, section_id: data.section_id, title: data.title, order_index: data.order_index || 99, content: data.content
                });
            }
            toast({ title: "Import Berhasil", description: `Materi '${data.title}' disimpan.` });

        } else if (importType === "program") {
             const { error: progError } = await supabase.from('programs').upsert({ id: data.id, title: data.title, category: data.category, description: data.description, salary: data.salary, duration: data.duration, source: data.source, what_you_learn: data.whatYouLearn });
            if (progError) throw progError;
            if (data.requirements?.length) {
                const reqPayload = data.requirements.map((r: any) => ({ program_id: data.id, req_id: r.id, label: r.label, note: r.note }));
                await supabase.from('program_requirements').delete().eq('program_id', data.id);
                await supabase.from('program_requirements').insert(reqPayload);
            }
            if (data.usefulLinks?.length) {
                const linkPayload = data.usefulLinks.map((l: any) => ({ program_id: data.id, label: l.label, url: l.url, description: l.description }));
                await supabase.from('program_links').delete().eq('program_id', data.id);
                await supabase.from('program_links').insert(linkPayload);
            }
            toast({ title: "Import Program Sukses!", description: `Program '${data.title}' disimpan.` });
            fetchPrograms();

        } else if (importType === "quiz") {
            let quizId;
            const { data: existingQuiz } = await supabase.from("quizzes").select("id").eq("level", data.level).maybeSingle();
            
            if(existingQuiz) {
                quizId = existingQuiz.id;
                await supabase.from("quizzes").update({ title: data.title }).eq("id", quizId);
            } else {
                const { data: newQuiz, error: qErr } = await supabase.from("quizzes").insert({ level: data.level, title: data.title }).select().single();
                if(qErr) throw qErr;
                quizId = newQuiz.id;
            }

            const questionsPayload = data.questions.map((q: any, idx: number) => ({ quiz_id: quizId, question: q.question, type: q.type, options: q.options || null, correct_answer: q.correct_answer, explanation: q.explanation || "", order_index: idx + 1 }));
            const { error: qError } = await supabase.from("quiz_questions").insert(questionsPayload);
            if (qError) throw qError;
            toast({ title: "Import Quiz Sukses!", description: `${data.questions.length} soal ditambahkan.` });
            fetchQuizzes();
        }
        setJsonInput(""); fetchStats();
    } catch (e: any) { 
        toast({ variant: "destructive", title: "Gagal Import", description: e.message }); 
    } finally { 
        setIsUploading(false); 
    }
  };

  const getPlaceholder = () => { 
      // UPDATE: Tambah field category di placeholder
      if (importType === "vocab") return `{\n "level_id": "A1",\n "slug": "a1-perkenalan",\n "title": "Perkenalan Diri",\n "vocabulary": [\n  {"german": "Hallo", "indonesian": "Halo", "example": "Hallo, wie geht's?", "category": "phrase"},\n  {"german": "der Tisch", "indonesian": "Meja", "example": "Das ist ein Tisch.", "category": "noun"}\n ]\n}`;
      if (importType === "material") return `{\n "level_id": "A1",\n "section_id": "a1_1_intro",\n "title": "Intro to German",\n "order_index": 1,\n "content": [\n  {"type": "text", "content": "Halo, selamat datang!"}\n ]\n}`;
      if (importType === "program") return `{\n "id": "aupair",\n "title": "Au Pair",\n "category": "general",\n "description": "Program pertukaran budaya...",\n "salary": "€280/bulan",\n "duration": "1 Tahun",\n "source": "aupair.com",\n "whatYouLearn": ["Budaya Jerman", "Bahasa Sehari-hari"],\n "requirements": [\n  {"id": "usia", "label": "Usia", "note": "18-26 Tahun"}\n ],\n "usefulLinks": [\n  {"label": "Official Info", "url": "https://...", "description": "Web resmi"}\n ]\n}`;
      if (importType === "quiz") return `{\n "level": "A1",\n "title": "Ujian A1 Dasar",\n "questions": [\n  {\n   "question": "Apa arti 'Danke'?",\n   "type": "multiple-choice",\n   "options": ["Halo", "Terima Kasih", "Maaf"],\n   "correct_answer": "Terima Kasih",\n   "explanation": "Danke artinya terima kasih."\n  }\n ]\n}`;
      return `{\n "note": "Pilih tipe data dulu..." \n}`;
  };

  if (isCheckingRole) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin h-10 w-10 text-slate-800"/></div>;
  if (!user || !isAdmin) return <div className="h-screen flex items-center justify-center">Access Denied</div>;

  return (
    <div className="fixed inset-0 z-[99999] flex bg-slate-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={cn("fixed lg:relative z-50 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out bg-white border-l lg:border-r lg:border-l-0 border-slate-200 shadow-2xl lg:shadow-none right-0 lg:left-0 lg:right-auto", mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0")}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="bg-black text-white p-1.5 rounded"><LayoutDashboard className="w-5 h-5" /></div><span className="font-bold text-lg tracking-tight">Admin<span className="text-slate-400">Panel</span></span></div>
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
              <button onClick={() => {setActiveMenu("dashboard"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "dashboard" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><Home className="w-4 h-4"/> Dashboard</button>
              <div className="my-6 border-t border-slate-100"></div>
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Content</p>
              <button onClick={() => {setActiveMenu("vocab"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "vocab" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><Database className="w-4 h-4"/> Database Kosakata</button>
              <button onClick={() => {setActiveMenu("material"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "material" ? "bg-green-50 text-green-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><BookText className="w-4 h-4"/> Materi Bacaan</button>
              <button onClick={() => {setActiveMenu("quiz"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "quiz" ? "bg-yellow-50 text-yellow-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><HelpCircle className="w-4 h-4"/> Quiz Editor</button>
              <button onClick={() => {setActiveMenu("program"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "program" ? "bg-orange-50 text-orange-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><GraduationCap className="w-4 h-4"/> Program Studi</button>
              <div className="my-6 border-t border-slate-100"></div>
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System</p>
              <button onClick={() => {setActiveMenu("announcement"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "announcement" ? "bg-red-50 text-red-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><Megaphone className="w-4 h-4"/> Pengumuman</button>
              <button onClick={() => {setActiveMenu("import"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "import" ? "bg-purple-50 text-purple-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><FileJson className="w-4 h-4"/> Import JSON</button>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-2 text-slate-500 hover:text-black text-sm font-medium mb-3 px-2"><ArrowLeft className="w-4 h-4"/> Kembali ke Website</button>
              <div className="flex items-center gap-3 px-2"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center"><UserCircle className="w-5 h-5 text-slate-500"/></div><div className="flex-1 overflow-hidden"><p className="text-xs font-bold text-slate-900 truncate">{fullName}</p><p className="text-[10px] text-slate-500 truncate">Administrator</p></div><button onClick={() => { signOut(); navigate("/login"); }} className="text-slate-400 hover:text-red-500"><LogOut className="w-4 h-4"/></button></div>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
          <div className="lg:hidden px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2"><div className="bg-gradient-to-tr from-purple-600 to-blue-500 p-1.5 rounded-lg"><Crown className="w-4 h-4 text-white fill-white" /></div><span className="font-black text-lg text-slate-900 tracking-tight">Admin<span className="text-purple-600">.Dash</span></span></div>
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 active:scale-95 transition-transform"><Menu className="w-6 h-6"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-12">
              <div className="max-w-6xl mx-auto pb-20">
                  {/* DASHBOARD */}
                  {activeMenu === "dashboard" && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                          <div className="flex flex-col gap-1"><h1 className="text-3xl font-bold text-slate-900">Selamat Datang, {fullName.split(" ")[0]}.</h1><p className="text-slate-500">Ringkasan statistik konten pembelajaran.</p></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[{ label: "Level Aktif", val: stats.levels, icon: Crown, color: "text-blue-600", bg: "bg-blue-50" }, { label: "Total Bab", val: stats.lessons, icon: Layers, color: "text-green-600", bg: "bg-green-50" }, { label: "Kosakata", val: stats.vocabs, icon: BookOpen, color: "text-yellow-600", bg: "bg-yellow-50" }, { label: "Pengumuman", val: stats.announcements, icon: Megaphone, color: "text-red-600", bg: "bg-red-50" },].map((item, i) => (<Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-6 flex items-center gap-4"><div className={cn("p-3 rounded-xl", item.bg, item.color)}><item.icon className="w-6 h-6"/></div><div><p className="text-2xl font-bold text-slate-900">{item.val}</p><p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p></div></CardContent></Card>))}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white"><CardContent className="p-8"><div className="mb-6"><h3 className="text-xl font-bold mb-2">Ingin menambah data massal?</h3><p className="text-slate-400 text-sm">Gunakan fitur import JSON untuk mempercepat proses input materi dan kosakata.</p></div><Button onClick={() => setActiveMenu("import")} className="bg-white text-black hover:bg-slate-200 font-bold border-0">Mulai Import JSON</Button></CardContent></Card></div>
                      </div>
                  )}

                  {/* VOCAB, DIALOG, EXERCISE MANAGER */}
                  {activeMenu === "vocab" && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900">Kelola Konten Per Bab</h2></div>
                          <Card className="border shadow-sm"><CardContent className="p-6 grid md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="text-xs uppercase text-slate-500 font-bold">Pilih Level</Label><Select onValueChange={(val) => setSelectedLevelId(val)}><SelectTrigger className="h-11 bg-slate-50 border-slate-200"><SelectValue placeholder="Pilih Level..." /></SelectTrigger><SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.id} - {l.title}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label className="text-xs uppercase text-slate-500 font-bold">Pilih Bab</Label><Select disabled={!selectedLevelId} onValueChange={(val) => setSelectedLessonId(val)} value={selectedLessonId || ""}><SelectTrigger className="h-11 bg-slate-50 border-slate-200"><SelectValue placeholder={isLoadingData ? "Loading..." : "Pilih Bab..."} /></SelectTrigger><SelectContent>{lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
                          {selectedLevelId && !selectedLessonId && (<Card className="border shadow-sm"><div className="p-4 border-b flex justify-between items-center bg-slate-50/50"><h3 className="font-bold text-slate-700">Daftar Bab ({selectedLevelId})</h3><Button onClick={() => openCreateDialog("lesson")} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold"><Plus className="w-4 h-4 mr-1"/> Bab Baru</Button></div><Table><TableHeader><TableRow><TableHead>Index</TableHead><TableHead>Judul</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{lessons.map(ls => (<TableRow key={ls.id}><TableCell className="font-bold text-slate-500">#{ls.order_index}</TableCell><TableCell className="font-medium">{ls.title}</TableCell><TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(ls, "lesson")}><Edit2 className="w-4 h-4 text-slate-500"/></Button><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => confirmDelete(ls, "lesson")}><Trash2 className="w-4 h-4 text-red-500"/></Button></TableCell></TableRow>))}</TableBody></Table></Card>)}
                          
                          {selectedLessonId && (
                            <div className="space-y-4">
                                {/* SUB-TAB NAVIGATION */}
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {[
                                        {id: "vocab", label: "Kosakata", icon: BookOpen},
                                        {id: "dialog", label: "Dialog", icon: MessageCircle},
                                        {id: "exercise", label: "Latihan", icon: HelpCircle},
                                    ].map((tab) => (
                                        <button 
                                            key={tab.id}
                                            onClick={() => setActiveVocabTab(tab.id as any)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap",
                                                activeVocabTab === tab.id ? "bg-slate-900 text-white shadow-md" : "bg-white border text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            <tab.icon className="w-4 h-4"/> {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* CONTENT PER SUB-TAB */}
                                <Card className="border shadow-sm">
                                    <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                                        <h3 className="font-bold text-slate-700 capitalize">Daftar {activeVocabTab}</h3>
                                        <Button onClick={() => openCreateDialog(activeVocabTab as any)} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold"><Plus className="w-4 h-4 mr-1"/> Tambah Data</Button>
                                    </div>

                                    {/* TABLE: VOCAB */}
                                    {activeVocabTab === "vocab" && (
                                        <>
                                            <div className="p-4 border-b bg-white">
                                                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><Input placeholder="Cari kata..." className="pl-9" value={vocabSearchTerm} onChange={(e) => setVocabSearchTerm(e.target.value)} /></div>
                                            </div>
                                            <div className="max-h-[500px] overflow-y-auto">
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>Jerman</TableHead><TableHead>Indonesia</TableHead><TableHead>Kategori</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {vocabs.filter(v => v.german.toLowerCase().includes(vocabSearchTerm.toLowerCase()) || v.indonesian.toLowerCase().includes(vocabSearchTerm.toLowerCase())).map(v => (
                                                        <TableRow key={v.id}>
                                                            <TableCell className="font-bold text-blue-700">{v.german}</TableCell>
                                                            <TableCell>{v.indonesian}</TableCell>
                                                            <TableCell>
                                                                {/* UPDATE: Tampilkan Kategori di Tabel */}
                                                                <span className={cn(
                                                                    "px-2 py-1 text-[10px] font-bold uppercase rounded border",
                                                                    v.category === 'noun' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                                    v.category === 'verb' ? "bg-red-50 text-red-600 border-red-200" :
                                                                    v.category === 'adjective' ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                                                                    v.category === 'phrase' ? "bg-purple-50 text-purple-600 border-purple-200" :
                                                                    "bg-slate-50 text-slate-600 border-slate-200"
                                                                )}>
                                                                    {v.category || '-'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(v, "vocab")}><Edit2 className="w-4 h-4 text-slate-500"/></Button><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => confirmDelete(v, "vocab")}><Trash2 className="w-4 h-4 text-red-500"/></Button></TableCell>
                                                        </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </>
                                    )}

                                    {/* TABLE: DIALOG */}
                                    {activeVocabTab === "dialog" && (
                                        <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                                            {dialogs.length === 0 && <p className="text-slate-400 text-center py-4">Belum ada dialog.</p>}
                                            {dialogs.map(d => (
                                                <div key={d.id} className="border rounded-lg p-4 bg-white hover:border-blue-400 transition-colors relative group">
                                                    <h4 className="font-bold text-lg mb-1 pr-24 break-words">{d.title}</h4>
                                                    <div className="text-xs bg-slate-100 p-2 rounded font-mono line-clamp-3">
                                                        {d.dialog_lines && d.dialog_lines.length > 0 ? (
                                                            d.dialog_lines.map((l: any, i: number) => <div key={i}><span className="font-bold">{l.speaker}:</span> {l.german}</div>)
                                                        ) : "No lines."}
                                                    </div>
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditDialog(d, "dialog")}><Edit2 className="w-3 h-3"/></Button>
                                                        <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => confirmDelete(d, "dialog")}><Trash2 className="w-3 h-3"/></Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* TABLE: EXERCISE */}
                                    {activeVocabTab === "exercise" && (
                                        <div className="max-h-[500px] overflow-y-auto">
                                            <Table>
                                                <TableHeader><TableRow><TableHead>Pertanyaan</TableHead><TableHead>Jawaban Benar</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                    {exercises.map(e => (
                                                    <TableRow key={e.id}>
                                                        <TableCell className="font-medium">{e.question}</TableCell>
                                                        <TableCell className="text-green-600 font-bold">
                                                            {/* Show the correct option text based on index */}
                                                            {e.options && e.options[e.correct_answer] ? e.options[e.correct_answer] : `Index ${e.correct_answer}`}
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(e, "exercise")}><Edit2 className="w-4 h-4 text-slate-500"/></Button><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => confirmDelete(e, "exercise")}><Trash2 className="w-4 h-4 text-red-500"/></Button></TableCell>
                                                    </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </Card>
                            </div>
                          )}
                      </div>
                  )}

                  {/* MATERIAL MANAGER */}
                  {activeMenu === "material" && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><h2 className="text-2xl font-bold text-slate-900">Content Management</h2><div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">{levels.map(l => (<button key={l.id} onClick={() => { setSelectedLevelId(l.id); fetchMaterials(l.id); }} className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", selectedLevelId === l.id ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>{l.id}</button>))}</div></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <button onClick={() => openMaterialDialog(null)} className="h-auto min-h-[220px] rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 gap-3 group bg-slate-50/50"><div className="p-4 bg-white shadow-sm border border-slate-200 rounded-full group-hover:scale-110 transition-transform"><Plus className="w-6 h-6"/></div><span className="font-bold text-sm">Buat Materi Baru</span></button>
                              {materials.map((mat) => (
                                <div key={mat.id} className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all group flex flex-col h-full min-h-[220px] w-full min-w-0">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="px-2 py-1 bg-slate-100 text-[10px] font-mono font-bold text-slate-500 rounded border border-slate-200">{mat.section_id}</span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-slate-300">#{mat.order_index}</span>
                                        <div className="flex flex-col">
                                          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-slate-100 hover:text-blue-600" onClick={() => handleMoveMaterial(mat, 'up')} disabled={isLoadingData}><ArrowUp className="w-3 h-3"/></Button>
                                          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-slate-100 hover:text-blue-600" onClick={() => handleMoveMaterial(mat, 'down')} disabled={isLoadingData}><ArrowDown className="w-3 h-3"/></Button>
                                        </div>
                                      </div>
                                    </div>
                                    <h3 className="font-bold text-lg leading-snug mb-2 text-slate-800 group-hover:text-blue-600 transition-colors break-words">{mat.title}</h3>
                                    <div className="text-xs text-slate-400 mb-4 flex-grow break-words">
                                      {Array.isArray(mat.content) && mat.content.find((c: any) => c.type === 'text')?.content ? (
                                        <p className="line-clamp-none whitespace-pre-wrap">{mat.content.find((c: any) => c.type === 'text').content}</p>
                                      ) : "Tidak ada preview teks."}
                                    </div>
                                    <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50"><Button onClick={() => openMaterialDialog(mat)} variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"><Edit2 className="w-3 h-3 mr-2"/> Edit</Button><Button onClick={() => confirmDelete(mat, "material")} variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                                </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* PROGRAM MANAGER */}
                  {activeMenu === "program" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-slate-900">Program Studi</h2>
                            <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
                                <button onClick={() => setProgramFilter("all")} className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", programFilter === "all" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>Semua</button>
                                <button onClick={() => setProgramFilter("general")} className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", programFilter === "general" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>Program Umum</button>
                                <button onClick={() => setProgramFilter("ausbildung")} className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", programFilter === "ausbildung" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>Ausbildung</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button onClick={() => openProgramDialog(null)} className="h-auto min-h-[220px] rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-orange-600 gap-3 group bg-slate-50/50">
                                <div className="p-4 bg-white shadow-sm border border-slate-200 rounded-full group-hover:scale-110 transition-transform"><Plus className="w-6 h-6"/></div>
                                <span className="font-bold text-sm">Tambah Program</span>
                            </button>
                            {programs
                              .filter(prog => {
                                if (programFilter === "general") return prog.category === "general";
                                if (programFilter === "ausbildung") return prog.category !== "general";
                                return true;
                              })
                              .map((prog) => (
                                <div key={prog.id} className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all group flex flex-col h-full min-h-[220px] w-full min-w-0">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-1 bg-slate-100 text-[10px] font-mono font-bold text-slate-500 rounded border border-slate-200 uppercase">{prog.category || "General"}</span>
                                        <span className="text-xs font-bold text-slate-300">{prog.id}</span>
                                    </div>
                                    <h3 className="font-bold text-lg leading-snug mb-2 text-slate-800 group-hover:text-orange-600 transition-colors break-words">{prog.title}</h3>
                                    <p className="text-xs text-slate-400 mb-4 line-clamp-none flex-grow break-words">{prog.description}</p>
                                    <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                                        <Button onClick={() => openProgramDialog(prog)} variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"><Edit2 className="w-3 h-3 mr-2"/> Edit</Button>
                                        <Button onClick={() => confirmDelete(prog, "program")} variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  {/* QUIZ MANAGER (UPDATED: LIST + EDITOR) */}
                  {activeMenu === "quiz" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h2 className="text-2xl font-bold text-slate-900">Quiz Editor</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* KOLOM KIRI: LIST SOAL */}
                            <div className="lg:col-span-1 space-y-4">
                                <Card className="border-4 border-slate-200 shadow-sm">
                                    <CardHeader className="bg-slate-50/50 border-b pb-4"><CardTitle className="text-lg">1. Pilih Level & Soal</CardTitle></CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Level Quiz</Label>
                                            <Select onValueChange={setSelectedQuizId} value={selectedQuizId}>
                                                <SelectTrigger className="font-bold h-11"><SelectValue placeholder="Pilih Level..." /></SelectTrigger>
                                                <SelectContent>{quizzes.map((q) => (<SelectItem key={q.id} value={q.id}>{q.level} - {q.title}</SelectItem>))}</SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* LIST PERTANYAAN */}
                                        {selectedQuizId && (
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                                <Label className="text-xs font-bold text-slate-400 uppercase">Daftar Pertanyaan ({quizQuestions.length})</Label>
                                                <div className="flex flex-col gap-2">
                                                    <Button variant="outline" className="justify-start text-green-600 border-green-200 hover:bg-green-50" onClick={() => {
                                                        setEditingQuestion(null);
                                                        setQuizQuestionText(""); setQuizExplanation(""); setQuizOptions(["","",""]); setQuizCorrectOption(""); setQuizBlankAnswer(""); setQuizReorderSentence("");
                                                    }}>
                                                        <Plus className="w-4 h-4 mr-2"/> Tambah Soal Baru
                                                    </Button>
                                                    {quizQuestions.map((q, idx) => (
                                                        <div key={q.id} className={cn("p-3 rounded border text-left text-sm cursor-pointer hover:bg-slate-50 transition-colors group flex justify-between items-center gap-2", editingQuestion?.id === q.id ? "border-blue-500 bg-blue-50" : "border-slate-200")} onClick={() => loadQuestionForEdit(q)}>
                                                            <div className="flex-1 line-clamp-2"><span className="font-bold mr-2 text-slate-400">#{q.order_index}</span>{q.question}</div>
                                                            <div className="flex flex-col gap-0.5 shrink-0">
                                                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-200" onClick={(e) => {e.stopPropagation(); handleMoveQuizQuestion(q, 'up')}}><ArrowUp className="w-3 h-3"/></Button>
                                                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-200" onClick={(e) => {e.stopPropagation(); handleMoveQuizQuestion(q, 'down')}}><ArrowDown className="w-3 h-3"/></Button>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500 shrink-0" onClick={(e) => {e.stopPropagation(); confirmDelete(q, "quiz_question")}}><Trash2 className="w-3 h-3"/></Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* KOLOM KANAN: EDITOR FORM */}
                            <Card className="lg:col-span-2 border-4 border-slate-200 shadow-sm h-fit">
                                <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row justify-between items-center">
                                    <CardTitle className="text-lg">{editingQuestion ? `Edit Soal #${editingQuestion.order_index}` : "Input Soal Baru"}</CardTitle>
                                    {editingQuestion && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">Mode Edit</span>}
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSaveQuizQuestion} className="space-y-6">
                                            <div className="space-y-2"><Label>Pertanyaan</Label><Textarea placeholder="Misal: Apa bahasa Jermannya 'Kucing'?" value={quizQuestionText} onChange={e => setQuizQuestionText(e.target.value)} required className="font-medium min-h-[80px]" /></div>
                                            <div className="space-y-2"><Label>Tipe Soal</Label><div className="flex gap-2">{["multiple-choice", "fill-blank", "reorder"].map((type) => (<div key={type} onClick={() => setQuizType(type as any)} className={cn("cursor-pointer px-4 py-2 rounded border-2 font-bold text-sm capitalize transition-all", quizType === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-400')}>{type.replace("-", " ")}</div>))}</div></div>
                                            
                                            <div className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-4">
                                                {quizType === "multiple-choice" && (<><Label>Pilihan Jawaban</Label>{quizOptions.map((opt, idx) => (<div key={idx} className="flex gap-2"><div className="w-10 h-10 flex items-center justify-center font-bold bg-white border rounded shrink-0">{String.fromCharCode(65 + idx)}</div><Input value={opt} onChange={(e) => {const newOpts = [...quizOptions]; newOpts[idx] = e.target.value; setQuizOptions(newOpts);}} placeholder={`Pilihan ${idx + 1}`} />{quizOptions.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => setQuizOptions(quizOptions.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-red-500"/></Button>}</div>))}<Button type="button" variant="outline" size="sm" onClick={() => setQuizOptions([...quizOptions, ""])}><Plus className="w-4 h-4 mr-2"/> Tambah Pilihan</Button><div className="pt-2"><Label>Kunci Jawaban</Label><Select onValueChange={setQuizCorrectOption} value={quizCorrectOption}><SelectTrigger className="bg-white border-green-500/50"><SelectValue placeholder="Pilih yang benar..." /></SelectTrigger><SelectContent>{quizOptions.filter(o => o).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div></>)}
                                                {quizType === "fill-blank" && (<div className="space-y-2"><Label>Kunci Jawaban (Satu Kata)</Label><Input value={quizBlankAnswer} onChange={e => setQuizBlankAnswer(e.target.value)} placeholder="Misal: Katze" className="bg-white"/></div>)}
                                                {quizType === "reorder" && (<div className="space-y-2"><Label>Kalimat Benar (Pisahkan koma)</Label><Textarea value={quizReorderSentence} onChange={e => setQuizReorderSentence(e.target.value)} placeholder="Misal: Ich, gehe, heute, ins, Kino" className="bg-white"/></div>)}
                                            </div>
                                            
                                            <div className="space-y-2"><Label>Penjelasan (Opsional)</Label><Textarea value={quizExplanation} onChange={e => setQuizExplanation(e.target.value)} placeholder="Kenapa jawabannya itu?"/></div>
                                            
                                            <div className="flex gap-3">
                                                {editingQuestion && <Button type="button" variant="outline" className="flex-1" onClick={() => {setEditingQuestion(null); setQuizQuestionText(""); setQuizExplanation("");}}>Batal Edit</Button>}
                                                <Button type="submit" disabled={isUploading} className="flex-1 h-12 font-bold text-lg bg-green-600 hover:bg-green-700 text-white">{isUploading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} {editingQuestion ? "Update Soal" : "Simpan Soal"}</Button>
                                            </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                  )}

                  {/* IMPORT MANAGER */}
                  {activeMenu === "import" && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                          <h2 className="text-2xl font-bold text-slate-900">Import JSON</h2>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              <Card className="lg:col-span-1 border-0 shadow-sm h-fit"><CardContent className="p-6 space-y-4"><div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-500">Tipe Data</Label><Select value={importType} onValueChange={(val: any) => setImportType(val)}><SelectTrigger className="font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vocab">KOSAKATA</SelectItem><SelectItem value="material">MATERI</SelectItem><SelectItem value="quiz">QUIZ / SOAL</SelectItem><SelectItem value="program">PROGRAM STUDI</SelectItem></SelectContent></Select></div><div className="bg-slate-50 p-4 rounded-lg border text-xs font-mono text-slate-600 overflow-auto max-h-[400px]"><p className="font-bold mb-2 text-slate-400">Template:</p><pre className="whitespace-pre-wrap break-words">{getPlaceholder()}</pre></div></CardContent></Card>
                              <Card className="lg:col-span-2 border-0 shadow-sm flex flex-col"><CardHeader className="border-b bg-slate-50/50"><CardTitle className="text-base font-bold flex items-center gap-2"><FileCode className="w-4 h-4"/> Editor</CardTitle></CardHeader><CardContent className="p-0 flex-1 flex flex-col"><Textarea className="flex-1 min-h-[400px] border-0 rounded-none p-6 font-mono text-xs focus-visible:ring-0 bg-white" placeholder="// Paste JSON di sini..." value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} spellCheck={false} /><div className="p-4 border-t bg-slate-50 flex justify-end"><Button onClick={handleSmartImport} disabled={isUploading || !jsonInput} className="font-bold bg-black text-white hover:bg-slate-800">{isUploading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <UploadCloud className="w-4 h-4 mr-2"/>} Proses Import</Button></div></CardContent></Card>
                          </div>
                      </div>
                  )}

                  {/* ANNOUNCEMENT MANAGER */}
                  {activeMenu === "announcement" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-slate-900">Pengumuman System</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Tombol Tambah */}
                        <button onClick={() => openAnnouncementDialog(null)} className="h-auto min-h-[200px] rounded-xl border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-red-600 gap-3 group bg-slate-50/50">
                          <div className="p-4 bg-white shadow-sm border border-slate-200 rounded-full group-hover:scale-110 transition-transform"><Plus className="w-6 h-6"/></div>
                          <span className="font-bold text-sm">Buat Pengumuman</span>
                        </button>

                        {/* List Pengumuman */}
                        {announcements.map((ann) => (
                          <div key={ann.id} className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all group flex flex-col h-full min-h-[200px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Megaphone className="w-24 h-24 text-red-600 -rotate-12" />
                            </div>
                            
                            <div className="flex justify-between items-start mb-3 relative z-10">
                              <div className="flex gap-2">
                                <span className={cn("px-2 py-1 text-[10px] font-bold rounded border uppercase flex items-center gap-1", ann.type === 'popup' ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200")}>
                                  {ann.type === 'popup' ? <BellRing className="w-3 h-3"/> : <MoveHorizontal className="w-3 h-3"/>}
                                  {ann.type}
                                </span>
                                <span className={cn("px-2 py-1 text-[10px] font-bold rounded border uppercase flex items-center gap-1", ann.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                                  {ann.is_active ? <CheckCircle2 className="w-3 h-3"/> : <LogOut className="w-3 h-3"/>}
                                  {ann.is_active ? "Aktif" : "Non-Aktif"}
                                </span>
                              </div>
                            </div>

                            <h3 className="font-bold text-lg leading-snug mb-2 text-slate-800 group-hover:text-red-600 transition-colors relative z-10 line-clamp-2">{ann.title}</h3>
                            
                            <div className="text-xs text-slate-500 mb-4 flex-grow relative z-10">
                              {Array.isArray(ann.content) && ann.content.length > 0 
                                ? `${ann.content.length} Blok Konten` 
                                : "Tidak ada konten"}
                              <br/>
                              <span className="text-[10px] text-slate-400">ID: {ann.id.substring(0,8)}...</span>
                            </div>

                            <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50 relative z-10">
                              <Button onClick={() => openAnnouncementDialog(ann)} variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                                <Edit2 className="w-3 h-3 mr-2"/> Edit
                              </Button>
                              <Button onClick={() => confirmDelete(ann, "announcement")} variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50">
                                <Trash2 className="w-4 h-4"/>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
          </div>
      </main>

      {/* --- CUSTOM DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
         <DialogContent className="max-w-[90vw] sm:max-w-sm rounded-2xl p-6">
            <DialogHeader className="flex flex-col items-center gap-2 text-center pb-2">
                <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle className="w-8 h-8" /></div>
                <DialogTitle className="text-xl">Yakin hapus data ini?</DialogTitle>
                <DialogDescription>Data yang dihapus tidak bisa dikembalikan lagi.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-center gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
                <Button variant="destructive" className="flex-1" onClick={performDelete} disabled={isUploading}>{isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Ya, Hapus"}</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* --- ANNOUNCEMENT EDITOR DIALOG --- */}
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[85dvh] flex flex-col p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white my-4">
              <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between bg-slate-50/50 shrink-0">
                  <DialogTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-red-600"/> Editor Pengumuman</DialogTitle>
                  <DialogDescription className="hidden">..</DialogDescription>
              </DialogHeader>
              <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
                  <div className="w-full md:w-80 bg-white p-6 border-b md:border-b-0 md:border-r space-y-4 shrink-0">
                      <div className="space-y-1"><Label className="text-xs font-bold">Judul Pengumuman</Label><Input value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} className="font-bold" placeholder="Contoh: Maintenance Server"/></div>
                      
                      <div className="space-y-1">
                          <Label className="text-xs font-bold">Tipe Tampilan</Label>
                          <Select value={announcementForm.type} onValueChange={(val: any) => setAnnouncementForm({...announcementForm, type: val})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="popup"><span className="flex items-center gap-2"><BellRing className="w-3 h-3"/> Pop-up Modal</span></SelectItem>
                                  <SelectItem value="marquee"><span className="flex items-center gap-2"><MoveHorizontal className="w-3 h-3"/> Teks Berjalan</span></SelectItem>
                              </SelectContent>
                          </Select>
                      </div>

                      {announcementForm.type === 'marquee' && (
                          <div className="space-y-1">
                              <Label className="text-xs font-bold">Arah Gerak</Label>
                              <div className="flex gap-2">
                                  <Button size="sm" variant={announcementForm.direction === 'left' ? "default" : "outline"} onClick={() => setAnnouncementForm({...announcementForm, direction: 'left'})} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1"/> Ke Kiri</Button>
                                  <Button size="sm" variant={announcementForm.direction === 'right' ? "default" : "outline"} onClick={() => setAnnouncementForm({...announcementForm, direction: 'right'})} className="flex-1">Ke Kanan <ArrowLeft className="w-4 h-4 ml-1 rotate-180"/></Button>
                              </div>
                          </div>
                      )}

                      <div className="flex items-center justify-between border p-3 rounded-lg bg-white shadow-none">
                          <Label className="text-xs font-bold">Status Aktif</Label>
                          <Switch className="shadow-none border-none focus-visible:ring-0 data-[state=checked]:bg-green-600 [&_span]:shadow-none" checked={announcementForm.is_active} onCheckedChange={(chk) => setAnnouncementForm({...announcementForm, is_active: chk})} />
                      </div>
                  </div>

                  <div className="flex-1 bg-slate-50 p-4 md:p-6 flex flex-col gap-4">
                      {announcementForm.content.length === 0 && <div className="text-center text-slate-400 py-10 font-medium border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-40"><p>Belum ada konten.</p><p className="text-xs mt-1">Klik tombol di bawah untuk menambah isi pengumuman.</p></div>}
                      {announcementForm.content.map((block, idx) => (
                          <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm relative group animate-in slide-in-from-bottom-2 duration-300">
                              <div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 select-none cursor-default">{block.type}</span><Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeAnnounceBlock(idx)}><Trash2 className="w-4 h-4"/></Button></div>
                              
                              {/* --- RICH TEXT TOOLBAR --- */}
                              {block.type === 'text' && (
                                  <>
                                    <div className="flex gap-1 mb-2 border-b pb-2">
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => formatAnnounceText(idx, 'b', block.content)}><Bold className="w-3 h-3"/></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => formatAnnounceText(idx, 'i', block.content)}><Italic className="w-3 h-3"/></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => formatAnnounceText(idx, 'u', block.content)}><Underline className="w-3 h-3"/></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => formatAnnounceText(idx, 'a', block.content)}><Link2 className="w-3 h-3"/></Button>
                                    </div>
                                    <Label className="text-[10px] text-slate-400 mb-1 block">Teks (Support HTML)</Label>
                                    <Textarea id={`announce-text-${idx}`} value={block.content} onChange={(e) => updateAnnounceBlock(idx, "content", e.target.value)} placeholder="Tulis isi pengumuman..." className="min-h-[100px]" />
                                  </>
                              )}
                              
                              {block.type === 'list' && (<div className="space-y-1"><Label className="text-[10px] text-slate-400 mb-1 block">List Item (Pisahkan dengan Enter)</Label><Textarea value={block.items?.join("\n")} onChange={(e) => updateAnnounceBlock(idx, "items_raw", e.target.value)} placeholder="• Poin 1&#10;• Poin 2" className="min-h-[100px] bg-slate-50" /></div>)}
                              {block.type === 'image' && (<div className="space-y-3"><Label className="text-[10px] text-slate-400 block">Link Gambar</Label><Input value={block.src} onChange={(e) => updateAnnounceBlock(idx, "src", e.target.value)} placeholder="https://..." /></div>)}
                              {block.type === 'table' && (<div className="space-y-2"><Label className="text-[10px] text-slate-400 block">Format CSV</Label><Textarea defaultValue={getTableAsCSV(block)} onBlur={(e) => updateAnnounceBlock(idx, "csv_raw", e.target.value)} placeholder="Kolom A, Kolom B&#10;Data 1, Data 2" className="min-h-[100px] font-mono text-xs bg-slate-50" /></div>)}
                          </div>
                      ))}

                      <div className="grid grid-cols-2 sm:flex gap-2 justify-center pt-4 border-t border-slate-200 border-dashed mt-auto mb-6">
                          <Button variant="outline" size="sm" onClick={() => addAnnounceBlock('text')}><AlignLeft className="w-4 h-4 mr-2"/> Teks</Button>
                          <Button variant="outline" size="sm" onClick={() => addAnnounceBlock('list')}><List className="w-4 h-4 mr-2"/> List</Button>
                          <Button variant="outline" size="sm" onClick={() => addAnnounceBlock('image')}><ImageIcon className="w-4 h-4 mr-2"/> Gambar</Button>
                          <Button variant="outline" size="sm" onClick={() => addAnnounceBlock('table')}><Grid3X3 className="w-4 h-4 mr-2"/> Tabel</Button>
                      </div>
                  </div>
              </div>
              <DialogFooter className="px-6 py-4 border-t bg-white flex-col sm:flex-row gap-2 shrink-0">
                  <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>Batal</Button>
                  <Button onClick={handleSaveAnnouncement} disabled={isUploading} className="bg-red-600 hover:bg-red-700 text-white">Simpan Pengumuman</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* --- DIALOG EDIT FORM (VOCAB/LESSON/DIALOG/EXERCISE) --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[90dvh] w-full sm:max-w-md rounded-2xl border-0 shadow-xl overflow-hidden max-h-[85dvh] flex flex-col p-0 bg-white">
            <DialogHeader className="px-6 py-4 border-b shrink-0 bg-slate-50/50"><DialogTitle>{editingItem ? "Edit Data" : "Tambah Baru"}</DialogTitle><DialogDescription className="hidden">Form Data</DialogDescription></DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-4">
                {formType === "vocab" && (
                    <>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Kata Jerman</Label><Input value={formData.german} onChange={e => setFormData({...formData, german: e.target.value})} className="font-bold" placeholder="Contoh: der Apfel"/></div>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Arti Indonesia</Label><Input value={formData.indonesian} onChange={e => setFormData({...formData, indonesian: e.target.value})} className="font-bold" placeholder="Contoh: Apel"/></div>
                        
                        {/* UPDATE: PILIH KATEGORI */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-500">Kategori</Label>
                            <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                                <SelectTrigger><SelectValue placeholder="Pilih..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="noun">Nomen (Kata Benda)</SelectItem>
                                    <SelectItem value="verb">Verb (Kata Kerja)</SelectItem>
                                    <SelectItem value="adjective">Adjektiv (Sifat)</SelectItem>
                                    <SelectItem value="phrase">Frasa</SelectItem>
                                    <SelectItem value="adverb">Adverb (Keterangan)</SelectItem>
                                    <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Contoh Kalimat</Label><Textarea value={formData.example} onChange={e => setFormData({...formData, example: e.target.value})} placeholder="Contoh: Ich esse einen Apfel."/></div>
                    </>
                )}
                {/* ... (BAGIAN LAIN TETAP SAMA) ... */}
                {formType === "dialog" && (
                    <>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Judul Dialog</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="font-bold"/></div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-500">Isi Dialog (Dinamis)</Label>
                            {/* DYNAMIC DIALOG LINE EDITOR */}
                            <div className="border rounded-lg p-2 space-y-2 max-h-[40vh] overflow-y-auto">
                                {formData.dialog_lines.map((line, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 p-3 border rounded-lg bg-slate-50 shadow-sm relative group">
                                            <div className="flex gap-2 items-center">
                                                <span className="text-[10px] font-bold text-slate-400 w-6">#{idx+1}</span>
                                                <Input className="w-24 h-8 text-xs font-bold bg-white" placeholder="Speaker" value={line.speaker} onChange={e => {
                                                    const newLines = [...formData.dialog_lines];
                                                    newLines[idx].speaker = e.target.value;
                                                    setFormData({...formData, dialog_lines: newLines});
                                                }} />
                                                <Button size="icon" variant="ghost" className="h-8 w-8 ml-auto text-red-500 hover:bg-red-50" onClick={() => {
                                                    const newLines = formData.dialog_lines.filter((_, i) => i !== idx);
                                                    setFormData({...formData, dialog_lines: newLines});
                                                }}><Trash2 className="w-4 h-4"/></Button>
                                            </div>
                                            <Textarea className="text-sm min-h-[50px] bg-white resize-none" placeholder="Teks Jerman..." value={line.german} onChange={e => {
                                                const newLines = [...formData.dialog_lines];
                                                newLines[idx].german = e.target.value;
                                                setFormData({...formData, dialog_lines: newLines});
                                            }} />
                                            <Input className="h-8 text-xs bg-white" placeholder="Terjemahan Indonesia (Opsional)" value={line.indonesian || ""} onChange={e => {
                                                const newLines = [...formData.dialog_lines];
                                                newLines[idx].indonesian = e.target.value;
                                                setFormData({...formData, dialog_lines: newLines});
                                            }} />
                                    </div>
                                ))}
                                <Button size="sm" variant="outline" className="w-full text-xs border-dashed border-2 py-4 h-auto" onClick={() => setFormData({...formData, dialog_lines: [...formData.dialog_lines, {speaker: "A", german: "", indonesian: ""}]})}><Plus className="w-4 h-4 mr-2"/> Tambah Baris Dialog</Button>
                            </div>
                        </div>
                    </>
                )}
                {formType === "exercise" && (
                    <>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Pertanyaan</Label><Input value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="font-bold" placeholder="Soal latihan..."/></div>
                        
                        <div className="space-y-2 mt-2">
                           <Label className="text-xs font-bold text-slate-500">Pilihan Jawaban</Label>
                           {formData.options.map((opt, i) => (
                               <div key={i} className="flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">{String.fromCharCode(65+i)}</div>
                                   <Input value={opt} onChange={e => {
                                       const newOpts = [...formData.options];
                                       newOpts[i] = e.target.value;
                                       setFormData({...formData, options: newOpts});
                                   }} placeholder={`Pilihan ${String.fromCharCode(65+i)}`} />
                               </div>
                           ))}
                        </div>

                        <div className="space-y-1 mt-2">
                            <Label className="text-xs font-bold text-slate-500">Jawaban Benar</Label>
                            <Select value={String(formData.correct_answer_idx)} onValueChange={(val) => setFormData({...formData, correct_answer_idx: val})}>
                                <SelectTrigger><SelectValue placeholder="Pilih jawaban benar" /></SelectTrigger>
                                <SelectContent>
                                    {formData.options.map((opt, i) => (
                                        <SelectItem key={i} value={String(i)}>
                                            <span className="font-bold mr-2">{String.fromCharCode(65+i)}:</span> {opt || `(Kosong)`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
                {formType === "lesson" && (
                    <>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Judul Bab</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="font-bold" placeholder="Contoh: Perkenalan Diri"/></div>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Slug (ID Unik)</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="font-mono text-sm" placeholder="a1-perkenalan"/></div>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Urutan (Angka)</Label><Input type="number" value={formData.order_index} onChange={e => setFormData({...formData, order_index: e.target.value ? parseInt(e.target.value) : 0})} placeholder="1"/></div>
                    </>
                )}
                </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t bg-white flex-col sm:flex-row gap-2 shrink-0"><Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Batal</Button><Button onClick={handleSave} disabled={isUploading} className="w-full sm:w-auto">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG MATERI EDITOR (VISUAL BLOCK) --- */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[85dvh] flex flex-col p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white my-4">
              <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between bg-slate-50/50 shrink-0"><DialogTitle className="flex items-center gap-2"><BookText className="w-5 h-5 text-green-600"/> Materi Editor (Visual)</DialogTitle><DialogDescription className="hidden">Editor visual</DialogDescription></DialogHeader>
              <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
                  <div className="w-full md:w-80 bg-white p-6 border-b md:border-b-0 md:border-r space-y-4 shrink-0">
                      <div className="space-y-1"><Label className="text-xs font-bold">Judul Materi</Label><Input value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="font-bold" placeholder="Contoh: Pengenalan Alfabet"/></div>
                      <div className="space-y-1"><Label className="text-xs font-bold">ID Unik (Section ID)</Label><Input value={materialForm.section_id} onChange={e => setMaterialForm({...materialForm, section_id: e.target.value})} className="font-mono text-xs" placeholder="a1_1_intro"/></div>
                      <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label className="text-xs font-bold">Urutan</Label><Input type="number" value={materialForm.order_index} onChange={e => setMaterialForm({...materialForm, order_index: parseInt(e.target.value)})} /></div><div className="space-y-1"><Label className="text-xs font-bold">Level</Label><Select value={materialForm.level_id} onValueChange={(val) => setMaterialForm({...materialForm, level_id: val})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.id}</SelectItem>)}</SelectContent></Select></div></div>
                      
                      {/* RESOURCE LINK EDITOR - UPDATED WITH TYPE DROPDOWN */}
                      <div className="border-t pt-4 space-y-2">
                        <Label className="text-xs font-bold">Referensi / Link Luar</Label>
                        {materialForm.resources.map((res, idx) => (
                           <div key={idx} className="flex gap-2 items-start p-2 bg-slate-50 rounded border">
                             <div className="flex-1 space-y-2">
                               <div className="flex gap-2">
                                   <div className="flex-1">
                                       <Label className="text-[10px] text-slate-400">Judul Link</Label>
                                       <Input placeholder="Contoh: Video Youtube" className="text-xs h-8" value={res.title} onChange={e => {const r = [...materialForm.resources]; r[idx].title = e.target.value; setMaterialForm({...materialForm, resources: r})}} />
                                   </div>
                                   <div className="w-1/3">
                                       <Label className="text-[10px] text-slate-400">Tipe</Label>
                                       <Select value={res.type} onValueChange={(val) => {const r = [...materialForm.resources]; r[idx].type = val; setMaterialForm({...materialForm, resources: r})}}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="web">🌐 Web</SelectItem>
                                                <SelectItem value="pdf">📄 PDF</SelectItem>
                                                <SelectItem value="video">🎥 Video</SelectItem>
                                                <SelectItem value="audio">🎧 Audio</SelectItem>
                                            </SelectContent>
                                       </Select>
                                   </div>
                               </div>
                               <div>
                                   <Label className="text-[10px] text-slate-400">URL</Label>
                                   <Input placeholder="https://..." className="text-xs h-8" value={res.url} onChange={e => {const r = [...materialForm.resources]; r[idx].url = e.target.value; setMaterialForm({...materialForm, resources: r})}} />
                               </div>
                             </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8 mt-6 text-slate-400 hover:text-red-500" onClick={() => {const r = materialForm.resources.filter((_, i) => i !== idx); setMaterialForm({...materialForm, resources: r})}}><Trash2 className="w-4 h-4"/></Button>
                           </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full text-xs mt-2" onClick={() => setMaterialForm({...materialForm, resources: [...materialForm.resources, {title: "", url: "", type: "web"}]})}><Plus className="w-3 h-3 mr-1"/> Tambah Link</Button>
                      </div>

                      {/* UPDATE: INPUT TIPS DI MATERI EDITOR */}
                      <div className="border-t pt-4 space-y-2">
                           <Label className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Lightbulb className="w-3 h-3"/> Tips Penting (Baris baru = Poin baru)</Label>
                           <Textarea value={materialForm.tips} onChange={(e) => setMaterialForm({...materialForm, tips: e.target.value})} placeholder="Tips 1...&#10;Tips 2..." className="bg-yellow-50 border-yellow-200 text-xs min-h-[80px]" />
                      </div>

                  </div>
                  
                  <div className="flex-1 bg-slate-50 p-4 md:p-6 flex flex-col gap-4">
                      {materialForm.content.length === 0 && <div className="text-center text-slate-400 py-10 font-medium border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-40"><p>Belum ada konten.</p><p className="text-xs mt-1">Klik tombol di bawah untuk menambah isi materi.</p></div>}
                      {materialForm.content.map((block, idx) => (
                          <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm relative group animate-in slide-in-from-bottom-2 duration-300">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 select-none cursor-default">
                                      {block.type === 'text' ? 'Paragraf' : block.type === 'list' ? 'Daftar Poin' : block.type === 'image' ? 'Gambar' : 'Tabel'}
                                  </span>
                                  <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleMoveContentBlock(idx, 'up')} disabled={idx === 0}><ArrowUp className="w-4 h-4"/></Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleMoveContentBlock(idx, 'down')} disabled={idx === materialForm.content.length - 1}><ArrowDown className="w-4 h-4"/></Button>
                                      <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeContentBlock(idx)}><Trash2 className="w-4 h-4"/></Button>
                                  </div>
                              </div>
                              
                              {block.type === 'text' && (<><Label className="text-[10px] text-slate-400 mb-1 block">Isi Paragraf</Label><Textarea value={block.content} onChange={(e) => updateContentBlock(idx, "content", e.target.value)} placeholder="Tulis paragraf materi di sini..." className="min-h-[100px] border-slate-200 focus-visible:ring-1 text-base leading-relaxed" /></>)}
                              {block.type === 'list' && (<div className="space-y-1"><Label className="text-[10px] text-slate-400 mb-1 block">List Item (Pisahkan dengan Enter)</Label><Textarea value={block.items?.join("\n")} onChange={(e) => updateContentBlock(idx, "items_raw", e.target.value)} placeholder="• Poin Pertama&#10;• Poin Kedua" className="min-h-[100px] bg-slate-50 font-medium" /></div>)}
                              {block.type === 'image' && (<div className="space-y-3"><div className="flex flex-col sm:flex-row gap-4"><div className="flex-1 space-y-2"><Label className="text-[10px] text-slate-400 block">Link Gambar (URL)</Label><Input value={block.src} onChange={(e) => updateContentBlock(idx, "src", e.target.value)} placeholder="https://..." className="text-sm" /><Label className="text-[10px] text-slate-400 block">Deskripsi (Alt Text)</Label><Input value={block.alt} onChange={(e) => updateContentBlock(idx, "alt", e.target.value)} placeholder="Keterangan gambar" className="text-xs" /></div>{block.src && (<div className="w-full sm:w-24 h-24 bg-slate-100 rounded border flex items-center justify-center overflow-hidden shrink-0"><img src={block.src} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /></div>)}</div></div>)}
                              {block.type === 'table' && (<div className="space-y-2"><Label className="text-[10px] text-slate-400 block">Format CSV (Pisahkan koma)</Label><Textarea defaultValue={getTableAsCSV(block)} onBlur={(e) => updateContentBlock(idx, "csv_raw", e.target.value)} placeholder="Kolom A, Kolom B&#10;Data 1, Data 2" className="min-h-[100px] font-mono text-xs bg-slate-50" /></div>)}
                          </div>
                      ))}
                      <div className="grid grid-cols-2 sm:flex gap-2 justify-center pt-4 border-t border-slate-200 border-dashed mt-4 mb-10">
                          <Button variant="outline" size="sm" onClick={() => addContentBlock('text')} className="hover:bg-blue-50 hover:text-blue-600 border-slate-300"><AlignLeft className="w-4 h-4 mr-2"/> Teks</Button>
                          <Button variant="outline" size="sm" onClick={() => addContentBlock('list')} className="hover:bg-green-50 hover:text-green-600 border-slate-300"><List className="w-4 h-4 mr-2"/> List</Button>
                          <Button variant="outline" size="sm" onClick={() => addContentBlock('image')} className="hover:bg-pink-50 hover:text-pink-600 border-slate-300"><ImageIcon className="w-4 h-4 mr-2"/> Gambar</Button>
                          <Button variant="outline" size="sm" onClick={() => addContentBlock('table')} className="hover:bg-purple-50 hover:text-purple-600 border-slate-300"><Grid3X3 className="w-4 h-4 mr-2"/> Tabel</Button>
                      </div>
                  </div>
              </div>
              <DialogFooter className="px-6 py-4 border-t bg-white flex-col sm:flex-row gap-2 shrink-0"><Button variant="outline" onClick={() => setMaterialDialogOpen(false)} className="w-full sm:w-auto">Batal</Button><Button onClick={handleSaveMaterial} disabled={isUploading} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">Simpan Materi</Button></DialogFooter>
          </DialogContent>
      </Dialog>

      {/* --- DIALOG PROGRAM EDITOR (MANUAL) --- */}
      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[85dvh] flex flex-col p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white my-4">
              <DialogHeader className="px-6 py-4 border-b bg-slate-50/50 shrink-0"><DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-orange-600"/> Program Editor</DialogTitle><DialogDescription className="hidden">Editor Program</DialogDescription></DialogHeader>
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1"><Label>ID Program (Unik)</Label><Input value={programForm.id} onChange={e => setProgramForm({...programForm, id: e.target.value})} placeholder="aupair, aus_it, dll" className="font-mono text-xs"/></div>
                   <div className="space-y-1">
                      <Label>Kategori</Label>
                      {isCustomCategory ? (
                        <div className="flex gap-2">
                           <Input placeholder="Nama Kategori Baru" value={programForm.category} onChange={e => setProgramForm({...programForm, category: e.target.value})} className="font-bold text-orange-600" />
                           <Button variant="ghost" size="icon" onClick={() => setIsCustomCategory(false)}><RotateCcw className="w-4 h-4 text-slate-400"/></Button>
                        </div>
                      ) : (
                        <Select value={categoryList.includes(programForm.category) ? programForm.category : "custom"} onValueChange={(val) => {
                          if(val === "custom") { setIsCustomCategory(true); setProgramForm({...programForm, category: ""}); }
                          else { setProgramForm({...programForm, category: val}); }
                        }}>
                          <SelectTrigger><SelectValue placeholder="Pilih Kategori..." /></SelectTrigger>
                          <SelectContent>
                             {categoryList.map(cat => <SelectItem key={cat} value={cat}>{defaultCategoryLabels[cat] || cat}</SelectItem>)}
                             <SelectItem value="custom" className="text-orange-600 font-bold border-t mt-1 pt-1">+ Tambah Kategori Baru</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                   </div>
                   <div className="space-y-1 md:col-span-2"><Label>Judul Program</Label><Input value={programForm.title} onChange={e => setProgramForm({...programForm, title: e.target.value})} className="font-bold text-lg" placeholder="Nama Program"/></div>
                   <div className="space-y-1 md:col-span-2"><Label>Deskripsi</Label><Textarea value={programForm.description} onChange={e => setProgramForm({...programForm, description: e.target.value})} className="h-20" placeholder="Jelaskan detail program..."/></div>
                   <div className="space-y-1"><Label>Gaji</Label><Input value={programForm.salary} onChange={e => setProgramForm({...programForm, salary: e.target.value})} placeholder="€1000/bulan"/></div>
                   <div className="space-y-1"><Label>Durasi</Label><Input value={programForm.duration} onChange={e => setProgramForm({...programForm, duration: e.target.value})} placeholder="3 Tahun"/></div>
                   <div className="space-y-1 md:col-span-2"><Label>Sumber Info</Label><Input value={programForm.source} onChange={e => setProgramForm({...programForm, source: e.target.value})} placeholder="Contoh: ausbildung.de"/></div>
                </div>

                <div className="space-y-2 border-t pt-4">
                    <Label className="text-orange-600 font-bold uppercase text-xs">Apa yang dipelajari?</Label>
                    {programForm.what_you_learn.map((item, idx) => (
                        <div key={idx} className="flex gap-2"><Input value={item} onChange={e => {const arr = [...programForm.what_you_learn]; arr[idx] = e.target.value; setProgramForm({...programForm, what_you_learn: arr})}} placeholder="Poin pembelajaran" /><Button variant="ghost" size="icon" onClick={() => {const arr = [...programForm.what_you_learn]; arr.splice(idx, 1); setProgramForm({...programForm, what_you_learn: arr})}}><Trash2 className="w-4 h-4 text-red-400"/></Button></div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setProgramForm({...programForm, what_you_learn: [...programForm.what_you_learn, ""]})}><Plus className="w-3 h-3 mr-2"/> Tambah Poin</Button>
                </div>

                <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2 mb-2"><Label className="text-orange-600 font-bold uppercase text-xs">Persyaratan (Checklist)</Label></div>
                    
                    {/* Header Columns for Clarity - Hidden on Mobile */}
                    <div className="hidden md:grid grid-cols-12 gap-2 px-2 mb-1">
                        <span className="col-span-3 text-[10px] text-slate-400 font-bold">ID Unik (Kecil)</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">Nama Syarat</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">Keterangan</span>
                    </div>

                    {programForm.requirements.map((req, idx) => (
                        <div key={idx} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 p-4 md:p-2 border rounded-lg bg-slate-50 relative group">
                             <div className="md:col-span-3">
                                <Label className="md:hidden text-xs text-slate-400">ID Unik</Label>
                                <Input className="font-mono text-xs h-8" placeholder="req_id" value={req.req_id} onChange={e => {const arr = [...programForm.requirements]; arr[idx].req_id = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                             </div>
                             <div className="md:col-span-4">
                                <Label className="md:hidden text-xs text-slate-400">Label Syarat</Label>
                                <Input className="h-8 text-xs" placeholder="Label" value={req.label} onChange={e => {const arr = [...programForm.requirements]; arr[idx].label = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                             </div>
                             <div className="md:col-span-4">
                                <Label className="md:hidden text-xs text-slate-400">Catatan</Label>
                                <Input className="h-8 text-xs" placeholder="Note" value={req.note} onChange={e => {const arr = [...programForm.requirements]; arr[idx].note = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                             </div>
                             <div className="md:col-span-1 flex justify-end md:justify-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => {const arr = [...programForm.requirements]; arr.splice(idx, 1); setProgramForm({...programForm, requirements: arr})}}><Trash2 className="w-4 h-4"/></Button>
                             </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setProgramForm({...programForm, requirements: [...programForm.requirements, { req_id: "", label: "", note: "" }]})}><Plus className="w-3 h-3 mr-2"/> Tambah Syarat</Button>
                </div>

                <div className="space-y-2 border-t pt-4 mb-10">
                    <Label className="text-orange-600 font-bold uppercase text-xs">Website Terkait</Label>
                    
                     {/* Header Columns - Hidden on Mobile */}
                     <div className="hidden md:grid grid-cols-12 gap-2 px-2 mb-1">
                        <span className="col-span-3 text-[10px] text-slate-400 font-bold">Nama Web</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">URL Link</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">Deskripsi</span>
                    </div>

                    {programForm.links.map((link, idx) => (
                        <div key={idx} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 p-4 md:p-2 border rounded-lg bg-slate-50 relative group">
                             <div className="md:col-span-3">
                                <Label className="md:hidden text-xs text-slate-400">Nama Web</Label>
                                <Input className="h-8 text-xs" placeholder="Label" value={link.label} onChange={e => {const arr = [...programForm.links]; arr[idx].label = e.target.value; setProgramForm({...programForm, links: arr})}} />
                             </div>
                             <div className="md:col-span-4">
                                <Label className="md:hidden text-xs text-slate-400">URL Link</Label>
                                <Input className="h-8 text-xs" placeholder="https://..." value={link.url} onChange={e => {const arr = [...programForm.links]; arr[idx].url = e.target.value; setProgramForm({...programForm, links: arr})}} />
                             </div>
                             <div className="md:col-span-4">
                                <Label className="md:hidden text-xs text-slate-400">Deskripsi</Label>
                                <Input className="h-8 text-xs" placeholder="Deskripsi" value={link.description} onChange={e => {const arr = [...programForm.links]; arr[idx].description = e.target.value; setProgramForm({...programForm, links: arr})}} />
                             </div>
                             <div className="md:col-span-1 flex justify-end md:justify-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => {const arr = [...programForm.links]; arr.splice(idx, 1); setProgramForm({...programForm, links: arr})}}><Trash2 className="w-4 h-4"/></Button>
                             </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setProgramForm({...programForm, links: [...programForm.links, { label: "", url: "", description: "" }]})}><Plus className="w-3 h-3 mr-2"/> Tambah Link</Button>
                </div>

              </div>
              <DialogFooter className="px-6 py-4 border-t bg-white flex-col sm:flex-row gap-2 shrink-0"><Button variant="outline" onClick={() => setProgramDialogOpen(false)} className="w-full sm:w-auto">Batal</Button><Button onClick={handleSaveProgram} disabled={isUploading} className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto">Simpan Program</Button></DialogFooter>
          </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminPage;