import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Loader2, UploadCloud, FileJson, LogOut, Plus, Trash2, Edit2, 
  Layers, BookOpen, Crown, BookText, FileCode, LayoutDashboard, Database,
  Menu, X, Home, ArrowLeft, UserCircle, HelpCircle, Save, AlignLeft, List, Grid3X3, Image as ImageIcon, GraduationCap,
  ArrowUp, ArrowDown, Link as LinkIcon, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// --- TIPE DATA ---
type Level = { id: string; title: string; description: string };
type Lesson = { id: string; title: string; slug: string; level_id: string; order_index: number };
type Vocab = { id: string; german: string; indonesian: string; example: string; lesson_id: string };
type CourseMaterialDB = { id: string; title: string; section_id: string; level_id: string; order_index: number; content: any; resources?: any[] };
type QuizHeader = { id: string; level: string; title: string };
type QuizQuestionDB = { id: string; quiz_id: string; question: string; type: string; options: any; correct_answer: any; explanation: string; order_index: number };
type ProgramDB = {
  id: string; title: string; category: string; description: string; 
  salary: string; duration: string; source: string; what_you_learn: string[];
};

const AdminPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // --- STATE GLOBAL ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "vocab" | "material" | "quiz" | "program" | "import">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fullName, setFullName] = useState("Admin");

  // --- DATA STATE ---
  const [levels, setLevels] = useState<Level[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [materials, setMaterials] = useState<CourseMaterialDB[]>([]);
  const [quizzes, setQuizzes] = useState<QuizHeader[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionDB[]>([]);
  const [programs, setPrograms] = useState<ProgramDB[]>([]);
  
  // --- STATS ---
  const [stats, setStats] = useState({ levels: 0, lessons: 0, vocabs: 0, materials: 0, questions: 0, programs: 0 });

  // --- SELECTION STATE ---
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [programFilter, setProgramFilter] = useState<"all" | "general" | "ausbildung">("all");
  
  // --- QUIZ EDITOR STATE ---
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionDB | null>(null);
  const [quizQuestionText, setQuizQuestionText] = useState("");
  const [quizType, setQuizType] = useState<"multiple-choice" | "fill-blank" | "reorder">("multiple-choice");
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizOptions, setQuizOptions] = useState<string[]>(["", "", ""]);
  const [quizCorrectOption, setQuizCorrectOption] = useState("");
  const [quizBlankAnswer, setQuizBlankAnswer] = useState("");
  const [quizReorderSentence, setQuizReorderSentence] = useState("");

  // --- IMPORT STATE ---
  const [importType, setImportType] = useState<"vocab" | "material" | "quiz" | "program">("vocab");
  const [jsonInput, setJsonInput] = useState("");

  // --- UI STATE ---
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); 
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false); 
  const [programDialogOpen, setProgramDialogOpen] = useState(false); 
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formType, setFormType] = useState<"level" | "lesson" | "vocab">("vocab");
  
  // --- FORM INPUTS (VOCAB/LESSON) ---
  const [formData, setFormData] = useState({
    id: "", title: "", description: "", slug: "", order_index: 0,
    german: "", indonesian: "", example: ""
  });

  // --- FORM INPUTS (MATERIAL - VISUAL EDITOR) ---
  const [materialForm, setMaterialForm] = useState({
    id: "", title: "", section_id: "", level_id: "A1", order_index: 0,
    content: [] as any[],
    resources: [] as { title: string, url: string }[] 
  });

  // --- FORM INPUTS (PROGRAM - VISUAL EDITOR) ---
  const [programForm, setProgramForm] = useState({
    id: "", title: "", category: "general", description: "", salary: "", duration: "", source: "",
    what_you_learn: [] as string[],
    requirements: [] as { req_id: string, label: string, note: string }[],
    links: [] as { label: string, url: string, description: string }[]
  });

  // --- HELPER FUNCTIONS ---
  const resetForm = () => {
    setFormData({ id: "", title: "", description: "", slug: "", order_index: 0, german: "", indonesian: "", example: "" });
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
    if (newContent[index].type === "list" && key === "items_raw") {
        newContent[index].items = value.split("\n"); 
    } 
    else if (newContent[index].type === "table" && key === "csv_raw") {
        const lines = value.split("\n");
        const headers = lines[0] ? lines[0].split(",").map((s: string) => s.trim()) : [];
        const rows = lines.slice(1).map((line: string) => line.split(",").map((s: string) => s.trim()));
        newContent[index].headers = headers;
        newContent[index].rows = rows;
    }
    else {
        newContent[index] = { ...newContent[index], [key]: value };
    }
    setMaterialForm({ ...materialForm, content: newContent });
  };

  const getTableAsCSV = (block: any) => {
      if (!block.headers || !block.rows) return "";
      const headerStr = block.headers.join(", ");
      const rowsStr = block.rows.map((row: string[]) => row.join(", ")).join("\n");
      return `${headerStr}\n${rowsStr}`;
  };

  const removeContentBlock = (index: number) => {
    const newContent = materialForm.content.filter((_, i) => i !== index);
    setMaterialForm({ ...materialForm, content: newContent });
  };

  // 1. CEK ROLE & INIT
  useEffect(() => {
    const checkRole = async () => {
      if (!user) { setIsCheckingRole(false); return; }
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (user.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
      
      if (data?.role === "admin") {
        setIsAdmin(true);
        fetchLevels();
        fetchQuizzes();
        fetchStats();
        fetchPrograms();
      }
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
      setStats({ levels: cLevels || 0, lessons: cLessons || 0, vocabs: cVocabs || 0, materials: cMaterials || 0, questions: cQuestions || 0, programs: cPrograms || 0 });
  };

  const fetchLevels = async () => { const { data } = await supabase.from("levels").select("*").order("id"); if (data) setLevels(data); };
  const fetchQuizzes = async () => { const { data } = await supabase.from("quizzes").select("*").order("level"); if (data) setQuizzes(data); };
  const fetchPrograms = async () => { const { data } = await supabase.from("programs").select("*").order("id"); if (data) setPrograms(data); };

  const fetchLessons = async (levelId: string) => { setIsLoadingData(true); const { data } = await supabase.from("lessons").select("*").eq("level_id", levelId).order("order_index"); if (data) setLessons(data); setIsLoadingData(false); };
  const fetchVocabs = async (lessonId: string) => { setIsLoadingData(true); const { data } = await supabase.from("vocabularies").select("*").eq("lesson_id", lessonId).order("german"); if (data) setVocabs(data); setIsLoadingData(false); };
  const fetchMaterials = async (levelId: string) => { setIsLoadingData(true); const { data } = await supabase.from("course_materials").select("*").eq("level_id", levelId).order("order_index"); if (data) setMaterials(data); setIsLoadingData(false); };
  
  const fetchQuizQuestions = async (quizId: string) => {
      setIsLoadingData(true);
      const { data } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index");
      if (data) setQuizQuestions(data);
      setIsLoadingData(false);
  };

  useEffect(() => {
    if (selectedLevelId) {
        if (activeMenu === "vocab") { fetchLessons(selectedLevelId); setSelectedLessonId(null); setVocabs([]); } 
        else if (activeMenu === "material") { fetchMaterials(selectedLevelId); }
    }
  }, [selectedLevelId, activeMenu]);

  useEffect(() => { if (selectedLessonId && activeMenu === "vocab") fetchVocabs(selectedLessonId); }, [selectedLessonId]);
  
  useEffect(() => {
      if (selectedQuizId) {
          fetchQuizQuestions(selectedQuizId);
          setEditingQuestion(null); 
          setQuizQuestionText(""); setQuizExplanation("");
      }
  }, [selectedQuizId]);

  // --- REORDER LOGIC ---
  const handleMoveMaterial = async (item: CourseMaterialDB, direction: 'up' | 'down') => {
      const currentIndex = materials.findIndex(m => m.id === item.id);
      if (currentIndex === -1) return;
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= materials.length) return;
      const neighborItem = materials[targetIndex];

      setIsLoadingData(true);
      try {
          const update1 = await supabase.from('course_materials').update({ order_index: neighborItem.order_index }).eq('id', item.id);
          if (update1.error) throw update1.error;
          const update2 = await supabase.from('course_materials').update({ order_index: item.order_index }).eq('id', neighborItem.id);
          if (update2.error) throw update2.error;
          await fetchMaterials(selectedLevelId!);
          toast({ title: "Urutan Berhasil Diubah! 🔄" });
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Reorder", description: err.message }); } finally { setIsLoadingData(false); }
  };

  const loadQuestionForEdit = (q: QuizQuestionDB) => {
      setEditingQuestion(q);
      setQuizQuestionText(q.question);
      setQuizType(q.type as any);
      setQuizExplanation(q.explanation || "");
      if (q.type === 'multiple-choice') { setQuizOptions(q.options || ["", "", ""]); setQuizCorrectOption(q.correct_answer || ""); } 
      else if (q.type === 'fill-blank') { setQuizBlankAnswer(q.correct_answer || ""); } 
      else if (q.type === 'reorder') { setQuizReorderSentence(Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : ""); }
  };

  // 3. CRUD LOGIC
  const handleSave = async () => {
    setIsUploading(true);
    try {
      let error = null;
      if (formType === "vocab") {
        if (!selectedLessonId) throw new Error("Pilih Bab dulu!");
        const payload = { german: formData.german, indonesian: formData.indonesian, example: formData.example, lesson_id: selectedLessonId };
        if (editingItem) { const { error: err } = await supabase.from("vocabularies").update(payload).eq("id", editingItem.id); error = err; }
        else { const { error: err } = await supabase.from("vocabularies").insert(payload); error = err; }
        if (!error) fetchVocabs(selectedLessonId);
      } else if (formType === "lesson") {
        if (!selectedLevelId) throw new Error("Pilih Level dulu!");
        const payload = { title: formData.title, slug: formData.slug, order_index: formData.order_index, level_id: selectedLevelId };
        if (editingItem) { const { error: err } = await supabase.from("lessons").update(payload).eq("id", editingItem.id); error = err; }
        else { const { error: err } = await supabase.from("lessons").insert(payload); error = err; }
        if (!error) fetchLessons(selectedLevelId);
      }
      if (error) throw error;
      toast({ title: "Berhasil! ✅", description: "Data berhasil disimpan." });
      setDialogOpen(false);
      resetForm();
      fetchStats();
    } catch (err: any) { toast({ variant: "destructive", title: "Error", description: err.message }); } finally { setIsUploading(false); }
  };

  const handleSaveMaterial = async () => {
      setIsUploading(true);
      try {
          const payload = {
              level_id: materialForm.level_id, section_id: materialForm.section_id, title: materialForm.title,
              order_index: materialForm.order_index, content: materialForm.content, resources: materialForm.resources 
          };
          let error = null;
          if (editingItem) { const { error: err } = await supabase.from("course_materials").update(payload).eq("id", editingItem.id); error = err; }
          else { const { error: err } = await supabase.from("course_materials").insert(payload); error = err; }
          if (error) throw error;
          toast({ title: "Materi Tersimpan! 📚", description: "Database diperbarui." });
          setMaterialDialogOpen(false);
          if (selectedLevelId) fetchMaterials(selectedLevelId);
          fetchStats();
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Simpan", description: err.message }); } finally { setIsUploading(false); }
  };

  const handleSaveProgram = async () => {
      setIsUploading(true);
      try {
        const programPayload = {
            id: programForm.id, title: programForm.title, category: programForm.category,
            description: programForm.description, salary: programForm.salary, duration: programForm.duration,
            source: programForm.source, what_you_learn: programForm.what_you_learn
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
        setProgramDialogOpen(false);
        fetchPrograms();
        fetchStats();
      } catch (err: any) { toast({ variant: "destructive", title: "Gagal Simpan Program", description: err.message }); } finally { setIsUploading(false); }
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

  const handleDelete = async (id: string, type: "vocab" | "lesson" | "material" | "program" | "quiz_question") => {
    if (!confirm("Yakin hapus? Data tidak bisa dikembalikan.")) return;
    try {
        if (type === "vocab") { await supabase.from("vocabularies").delete().eq("id", id); if (selectedLessonId) fetchVocabs(selectedLessonId); }
        else if (type === "lesson") { await supabase.from("lessons").delete().eq("id", id); if (selectedLevelId) fetchLessons(selectedLevelId); }
        else if (type === "material") { await supabase.from("course_materials").delete().eq("id", id); if (selectedLevelId) fetchMaterials(selectedLevelId); }
        else if (type === "program") { await supabase.from("programs").delete().eq("id", id); fetchPrograms(); }
        else if (type === "quiz_question") { await supabase.from("quiz_questions").delete().eq("id", id); fetchQuizQuestions(selectedQuizId); }
        toast({ title: "Terhapus", description: "Data sudah hilang." }); fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleSmartImport = async () => {
    if (!jsonInput) return;
    setIsUploading(true);
    try {
        const data = JSON.parse(jsonInput);
        if (importType === "vocab") {
            const { data: lesson, error } = await supabase.from("lessons").upsert({ level_id: data.level_id, slug: data.slug, title: data.title, order_index: 99 }, { onConflict: 'slug' }).select().single();
            if (error) throw error;
            if (data.vocabulary?.length) {
                const vocabPayload = data.vocabulary.map((v: any) => ({ lesson_id: lesson.id, german: v.german, indonesian: v.indonesian, example: v.example }));
                const { error: vocabErr } = await supabase.from("vocabularies").insert(vocabPayload);
                if (vocabErr) throw vocabErr;
            }
            toast({ title: "Import Berhasil", description: `Bab '${data.title}' ditambahkan.` });
        } else if (importType === "material") {
            const { error } = await supabase.from("course_materials").upsert({ level_id: data.level_id, section_id: data.section_id, title: data.title, order_index: data.order_index || 99, content: data.content }, { onConflict: 'section_id' });
            if (error) throw error;
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
            const { data: quizData, error: quizError } = await supabase.from("quizzes").upsert({ level: data.level, title: data.title }, { onConflict: 'level' }).select().single();
            if (quizError) throw quizError;
            const questionsPayload = data.questions.map((q: any, idx: number) => ({ quiz_id: quizData.id, question: q.question, type: q.type, options: q.options || null, correct_answer: q.correct_answer, explanation: q.explanation || "", order_index: idx + 1 }));
            const { error: qError } = await supabase.from("quiz_questions").insert(questionsPayload);
            if (qError) throw qError;
            toast({ title: "Import Quiz Sukses!", description: `${data.questions.length} soal ditambahkan.` });
            fetchQuizzes();
        }
        setJsonInput(""); fetchStats();
    } catch (e: any) { toast({ variant: "destructive", title: "Gagal Import", description: e.message }); } finally { setIsUploading(false); }
  };

  const getPlaceholder = () => {
      if (importType === "vocab") return `{\n  "level_id": "A1",\n  "title": "Judul Bab",\n  "slug": "judul_bab_unik",\n  "vocabulary": [\n    { "german": "Apfel", "indonesian": "Apel", "example": "Ich esse..." }\n  ]\n}`;
      if (importType === "program") return `{\n  "id": "contoh_id",\n  "title": "Nama Program",\n  "category": "health",\n  "description": "Deskripsi...",\n  "salary": "€1000",\n  "duration": "3 Tahun",\n  "whatYouLearn": ["Skill A", "Skill B"],\n  "requirements": [{ "id": "req1", "label": "Syarat A" }],\n  "usefulLinks": [{ "label": "Link A", "url": "..." }]\n}`;
      if (importType === "quiz") return `{\n  "level": "A2",\n  "title": "Evaluasi Level A2",\n  "questions": [\n    {\n      "type": "multiple-choice",\n      "question": "Was ist das?",\n      "options": ["Hund", "Katze", "Maus"],\n      "correct_answer": "Hund",\n      "explanation": "Penjelasan..."\n    }\n  ]\n}`;
      return `{\n  "level_id": "A1",\n  "section_id": "unik_id_materi",\n  "title": "Judul Materi",\n  "order_index": 1,\n  "content": [\n    { "type": "text", "content": "Halo dunia.\\nIni baris baru (pakai slash-n)." },\n    { "type": "table", "headers": ["A", "B"], "rows": [["1", "2"]] },\n    { "type": "image", "src": "https://placehold.co/600x400", "alt": "Deskripsi gambar" }\n  ],\n  "resources": [\n    { "title": "Sumber Referensi", "url": "https://google.com" }\n  ]\n}`;
  };

  const openProgramDialog = async (item: any | null) => {
      setEditingItem(item);
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

  const openEditDialog = (item: any, type: "vocab" | "lesson") => { setFormType(type); setEditingItem(item); setFormData({ ...formData, ...item }); setDialogOpen(true); };
  const openCreateDialog = (type: "vocab" | "lesson") => { setFormType(type); setEditingItem(null); setFormData({ id: "", title: "", description: "", slug: "", order_index: 0, german: "", indonesian: "", example: "" }); setDialogOpen(true); };
  
  const openMaterialDialog = (item: any | null) => {
      setEditingItem(item);
      if (item) {
          const rawContent = item.content;
          const parsedContent = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
          setMaterialForm({
              id: item.id, title: item.title, section_id: item.section_id, level_id: item.level_id, order_index: item.order_index,
              content: Array.isArray(parsedContent) ? parsedContent : [],
              resources: item.resources || []
          });
      } else {
          setMaterialForm({ id: "", title: "", section_id: "", level_id: selectedLevelId || "A1", order_index: 0, content: [{ type: "text", content: "" }], resources: [] });
      }
      setMaterialDialogOpen(true);
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
              <button onClick={() => {setActiveMenu("program"); setMobileMenuOpen(false)}} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", activeMenu === "program" ? "bg-orange-50 text-orange-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}><GraduationCap className="w-4 h-4"/> Program ke Jerman</button>
              <div className="my-6 border-t border-slate-100"></div>
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System</p>
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[{ label: "Level Aktif", val: stats.levels, icon: Crown, color: "text-blue-600", bg: "bg-blue-50" }, { label: "Total Bab", val: stats.lessons, icon: Layers, color: "text-green-600", bg: "bg-green-50" }, { label: "Kosakata", val: stats.vocabs, icon: BookOpen, color: "text-yellow-600", bg: "bg-yellow-50" }, { label: "Program ke Jerman", val: stats.programs, icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-50" },].map((item, i) => (<Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-6 flex items-center gap-4"><div className={cn("p-3 rounded-xl", item.bg, item.color)}><item.icon className="w-6 h-6"/></div><div><p className="text-2xl font-bold text-slate-900">{item.val}</p><p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p></div></CardContent></Card>))}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white"><CardContent className="p-8"><div className="mb-6"><h3 className="text-xl font-bold mb-2">Ingin menambah data massal?</h3><p className="text-slate-400 text-sm">Gunakan fitur import JSON untuk mempercepat proses input materi dan kosakata.</p></div><Button onClick={() => setActiveMenu("import")} className="bg-white text-black hover:bg-slate-200 font-bold border-0">Mulai Import JSON</Button></CardContent></Card></div>
                      </div>
                  )}

                  {/* VOCAB MANAGER */}
                  {activeMenu === "vocab" && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900">Kelola Kosakata</h2></div>
                          <Card className="border shadow-sm"><CardContent className="p-6 grid md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="text-xs uppercase text-slate-500 font-bold">Pilih Level</Label><Select onValueChange={(val) => setSelectedLevelId(val)}><SelectTrigger className="h-11 bg-slate-50 border-slate-200"><SelectValue placeholder="Pilih Level..." /></SelectTrigger><SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.id} - {l.title}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label className="text-xs uppercase text-slate-500 font-bold">Pilih Bab</Label><Select disabled={!selectedLevelId} onValueChange={(val) => setSelectedLessonId(val)} value={selectedLessonId || ""}><SelectTrigger className="h-11 bg-slate-50 border-slate-200"><SelectValue placeholder={isLoadingData ? "Loading..." : "Pilih Bab..."} /></SelectTrigger><SelectContent>{lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
                          {selectedLevelId && !selectedLessonId && (<Card className="border shadow-sm"><div className="p-4 border-b flex justify-between items-center bg-slate-50/50"><h3 className="font-bold text-slate-700">Daftar Bab ({selectedLevelId})</h3><Button onClick={() => openCreateDialog("lesson")} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold"><Plus className="w-4 h-4 mr-1"/> Bab Baru</Button></div><Table><TableHeader><TableRow><TableHead>Index</TableHead><TableHead>Judul</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{lessons.map(ls => (<TableRow key={ls.id}><TableCell className="font-bold text-slate-500">#{ls.order_index}</TableCell><TableCell className="font-medium">{ls.title}</TableCell><TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(ls, "lesson")}><Edit2 className="w-4 h-4 text-slate-500"/></Button><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(ls.id, "lesson")}><Trash2 className="w-4 h-4 text-red-500"/></Button></TableCell></TableRow>))}</TableBody></Table></Card>)}
                          {selectedLessonId && (<Card className="border shadow-sm"><div className="p-4 border-b flex justify-between items-center bg-slate-50/50"><h3 className="font-bold text-slate-700">Daftar Kata</h3><Button onClick={() => openCreateDialog("vocab")} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold"><Plus className="w-4 h-4 mr-1"/> Kata Baru</Button></div><Table><TableHeader><TableRow><TableHead>Jerman</TableHead><TableHead>Indonesia</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{vocabs.map(v => (<TableRow key={v.id}><TableCell className="font-bold text-blue-700">{v.german}</TableCell><TableCell>{v.indonesian}</TableCell><TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(v, "vocab")}><Edit2 className="w-4 h-4 text-slate-500"/></Button><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(v.id, "vocab")}><Trash2 className="w-4 h-4 text-red-500"/></Button></TableCell></TableRow>))}</TableBody></Table></Card>)}
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
                                    <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50"><Button onClick={() => openMaterialDialog(mat)} variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"><Edit2 className="w-3 h-3 mr-2"/> Edit</Button><Button onClick={() => handleDelete(mat.id, "material")} variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button></div>
                                </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* PROGRAM MANAGER */}
                  {activeMenu === "program" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-slate-900">Program ke Jerman</h2>
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
                                        <Button onClick={() => handleDelete(prog.id, "program")} variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button>
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
                                                        <div key={q.id} className={cn("p-3 rounded border text-left text-sm cursor-pointer hover:bg-slate-50 transition-colors group flex justify-between items-start", editingQuestion?.id === q.id ? "border-blue-500 bg-blue-50" : "border-slate-200")} onClick={() => loadQuestionForEdit(q)}>
                                                            <div className="line-clamp-2 flex-1"><span className="font-bold mr-2 text-slate-400">#{idx+1}</span>{q.question}</div>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500 -mt-1 -mr-1" onClick={(e) => {e.stopPropagation(); handleDelete(q.id, "quiz_question")}}><Trash2 className="w-3 h-3"/></Button>
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
                              <Card className="lg:col-span-1 border-0 shadow-sm h-fit"><CardContent className="p-6 space-y-4"><div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-500">Tipe Data</Label><Select value={importType} onValueChange={(val: any) => setImportType(val)}><SelectTrigger className="font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vocab">KOSAKATA</SelectItem><SelectItem value="material">MATERI</SelectItem><SelectItem value="quiz">QUIZ / SOAL</SelectItem><SelectItem value="program">PROGRAM KE JERMAN</SelectItem></SelectContent></Select></div><div className="bg-slate-50 p-4 rounded-lg border text-xs font-mono text-slate-600 overflow-auto max-h-[400px]"><p className="font-bold mb-2 text-slate-400">Template:</p><pre className="whitespace-pre-wrap break-words">{getPlaceholder()}</pre></div></CardContent></Card>
                              <Card className="lg:col-span-2 border-0 shadow-sm flex flex-col"><CardHeader className="border-b bg-slate-50/50"><CardTitle className="text-base font-bold flex items-center gap-2"><FileCode className="w-4 h-4"/> Editor</CardTitle></CardHeader><CardContent className="p-0 flex-1 flex flex-col"><Textarea className="flex-1 min-h-[400px] border-0 rounded-none p-6 font-mono text-xs focus-visible:ring-0 bg-white" placeholder="// Paste JSON di sini..." value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} spellCheck={false} /><div className="p-4 border-t bg-slate-50 flex justify-end"><Button onClick={handleSmartImport} disabled={isUploading || !jsonInput} className="font-bold bg-black text-white hover:bg-slate-800">{isUploading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <UploadCloud className="w-4 h-4 mr-2"/>} Proses Import</Button></div></CardContent></Card>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </main>

      {/* --- DIALOG EDIT FORM (VOCAB/LESSON) --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-[90vw] w-full sm:max-w-md rounded-2xl border-0 shadow-xl overflow-hidden max-h-[85vh] flex flex-col"><DialogHeader className="px-6 py-4 border-b"><DialogTitle>{editingItem ? "Edit Data" : "Tambah Baru"}</DialogTitle></DialogHeader><div className="grid gap-4 py-4 px-6 overflow-y-auto">{formType === "vocab" ? (<><div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Jerman</Label><Input value={formData.german} onChange={e => setFormData({...formData, german: e.target.value})} className="font-bold"/></div><div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Indonesia</Label><Input value={formData.indonesian} onChange={e => setFormData({...formData, indonesian: e.target.value})} className="font-bold"/></div><div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Contoh</Label><Textarea value={formData.example} onChange={e => setFormData({...formData, example: e.target.value})} /></div></>) : (<><div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Judul Bab</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="font-bold"/></div><div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Slug</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="font-mono text-sm"/></div><div className="space-y-1"><Label className="text-xs font-bold text-slate-500">Urutan</Label><Input type="number" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} /></div></>)}</div><DialogFooter className="px-6 py-4 border-t bg-white flex flex-col-reverse sm:flex-row gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Batal</Button><Button onClick={handleSave} disabled={isUploading} className="w-full sm:w-auto">Simpan</Button></DialogFooter></DialogContent></Dialog>

      {/* --- DIALOG MATERI EDITOR (VISUAL BLOCK) --- */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white my-4">
              <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between bg-slate-50/50 shrink-0"><DialogTitle className="flex items-center gap-2"><BookText className="w-5 h-5 text-green-600"/> Materi Editor (Visual)</DialogTitle></DialogHeader>
              <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
                  <div className="w-full md:w-80 bg-white p-6 border-b md:border-b-0 md:border-r space-y-4 shrink-0">
                      <div className="space-y-1"><Label className="text-xs font-bold">Judul Materi</Label><Input value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="font-bold" placeholder="Contoh: Pengenalan Alfabet"/></div>
                      <div className="space-y-1"><Label className="text-xs font-bold">ID Unik (Section ID)</Label><Input value={materialForm.section_id} onChange={e => setMaterialForm({...materialForm, section_id: e.target.value})} className="font-mono text-xs" placeholder="a1_1_intro"/></div>
                      <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label className="text-xs font-bold">Urutan</Label><Input type="number" value={materialForm.order_index} onChange={e => setMaterialForm({...materialForm, order_index: parseInt(e.target.value)})} /></div><div className="space-y-1"><Label className="text-xs font-bold">Level</Label><Select value={materialForm.level_id} onValueChange={(val) => setMaterialForm({...materialForm, level_id: val})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.id}</SelectItem>)}</SelectContent></Select></div></div>
                      
                      {/* RESOURCE LINK EDITOR */}
                      <div className="border-t pt-4 space-y-2">
                        <Label className="text-xs font-bold">Referensi / Link Luar</Label>
                        {materialForm.resources.map((res, idx) => (
                           <div key={idx} className="flex gap-2 items-start">
                             <div className="flex-1 space-y-1">
                               <Label className="text-[10px] text-slate-400">Judul Link</Label>
                               <Input placeholder="Contoh: Video Youtube" className="text-xs h-8" value={res.title} onChange={e => {const r = [...materialForm.resources]; r[idx].title = e.target.value; setMaterialForm({...materialForm, resources: r})}} />
                               <Label className="text-[10px] text-slate-400">URL</Label>
                               <Input placeholder="https://..." className="text-xs h-8" value={res.url} onChange={e => {const r = [...materialForm.resources]; r[idx].url = e.target.value; setMaterialForm({...materialForm, resources: r})}} />
                             </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8 mt-6" onClick={() => {const r = materialForm.resources.filter((_, i) => i !== idx); setMaterialForm({...materialForm, resources: r})}}><Trash2 className="w-3 h-3 text-red-400"/></Button>
                           </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full text-xs mt-2" onClick={() => setMaterialForm({...materialForm, resources: [...materialForm.resources, {title: "", url: ""}]})}><Plus className="w-3 h-3 mr-1"/> Tambah Link</Button>
                      </div>
                  </div>
                  
                  <div className="flex-1 bg-slate-50 p-4 md:p-6 flex flex-col gap-4">
                      {materialForm.content.length === 0 && <div className="text-center text-slate-400 py-10 font-medium border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-40"><p>Belum ada konten.</p><p className="text-xs mt-1">Klik tombol di bawah untuk menambah isi materi.</p></div>}
                      {materialForm.content.map((block, idx) => (
                          <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm relative group animate-in slide-in-from-bottom-2 duration-300">
                              <div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 select-none cursor-default">{block.type === 'text' ? 'Paragraf' : block.type === 'list' ? 'Daftar Poin' : block.type === 'image' ? 'Gambar' : 'Tabel'}</span><Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeContentBlock(idx)}><Trash2 className="w-4 h-4"/></Button></div>
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
          <DialogContent className="max-w-[95vw] w-full h-auto max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white my-4">
              <DialogHeader className="px-6 py-4 border-b bg-slate-50/50 shrink-0"><DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-orange-600"/> Program Editor</DialogTitle></DialogHeader>
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1"><Label>ID Program (Unik)</Label><Input value={programForm.id} onChange={e => setProgramForm({...programForm, id: e.target.value})} placeholder="aupair, aus_it, dll" className="font-mono text-xs"/></div>
                   <div className="space-y-1"><Label>Kategori</Label><Select value={programForm.category} onValueChange={(val) => setProgramForm({...programForm, category: val})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="general">Program Umum</SelectItem><SelectItem value="health">Kesehatan</SelectItem><SelectItem value="tech">Teknik & IT</SelectItem><SelectItem value="business">Bisnis</SelectItem><SelectItem value="gastro">Hotel & Resto</SelectItem><SelectItem value="craft">Handwerk</SelectItem><SelectItem value="logistics">Logistik</SelectItem><SelectItem value="science">Sains</SelectItem><SelectItem value="social">Sosial</SelectItem></SelectContent></Select></div>
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
                    
                    {/* Header Columns for Clarity */}
                    <div className="grid grid-cols-12 gap-2 px-2 mb-1">
                        <span className="col-span-3 text-[10px] text-slate-400 font-bold">ID Unik (Kecil)</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">Nama Syarat</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">Keterangan</span>
                    </div>

                    {programForm.requirements.map((req, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2 rounded border items-start">
                             <Input className="col-span-3 font-mono text-xs h-8" placeholder="req_id" value={req.req_id} onChange={e => {const arr = [...programForm.requirements]; arr[idx].req_id = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                             <Input className="col-span-4 h-8 text-xs" placeholder="Label" value={req.label} onChange={e => {const arr = [...programForm.requirements]; arr[idx].label = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                             <Input className="col-span-4 h-8 text-xs" placeholder="Note" value={req.note} onChange={e => {const arr = [...programForm.requirements]; arr[idx].note = e.target.value; setProgramForm({...programForm, requirements: arr})}} />
                             <Button variant="ghost" size="icon" className="col-span-1 h-8 w-8" onClick={() => {const arr = [...programForm.requirements]; arr.splice(idx, 1); setProgramForm({...programForm, requirements: arr})}}><Trash2 className="w-3 h-3 text-red-400"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setProgramForm({...programForm, requirements: [...programForm.requirements, { req_id: "", label: "", note: "" }]})}><Plus className="w-3 h-3 mr-2"/> Tambah Syarat</Button>
                </div>

                <div className="space-y-2 border-t pt-4 mb-10">
                    <Label className="text-orange-600 font-bold uppercase text-xs">Website Terkait</Label>
                    
                     {/* Header Columns */}
                     <div className="grid grid-cols-12 gap-2 px-2 mb-1">
                        <span className="col-span-3 text-[10px] text-slate-400 font-bold">Nama Web</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">URL Link</span>
                        <span className="col-span-4 text-[10px] text-slate-400 font-bold">Deskripsi</span>
                    </div>

                    {programForm.links.map((link, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2 rounded border items-start">
                             <Input className="col-span-3 h-8 text-xs" placeholder="Label" value={link.label} onChange={e => {const arr = [...programForm.links]; arr[idx].label = e.target.value; setProgramForm({...programForm, links: arr})}} />
                             <Input className="col-span-4 h-8 text-xs" placeholder="https://..." value={link.url} onChange={e => {const arr = [...programForm.links]; arr[idx].url = e.target.value; setProgramForm({...programForm, links: arr})}} />
                             <Input className="col-span-4 h-8 text-xs" placeholder="Deskripsi" value={link.description} onChange={e => {const arr = [...programForm.links]; arr[idx].description = e.target.value; setProgramForm({...programForm, links: arr})}} />
                             <Button variant="ghost" size="icon" className="col-span-1 h-8 w-8" onClick={() => {const arr = [...programForm.links]; arr.splice(idx, 1); setProgramForm({...programForm, links: arr})}}><Trash2 className="w-4 h-4 text-red-400"/></Button>
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