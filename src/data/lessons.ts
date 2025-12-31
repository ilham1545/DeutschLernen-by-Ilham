import { supabase } from "@/lib/supabase";

// --- TIPE DATA (JANGAN DIHAPUS - INI PENTING) ---
export interface Vocabulary {
  german: string;
  indonesian: string;
  example: string;
}

export interface Dialog {
  title: string;
  lines: { speaker: string; german: string; indonesian: string }[];
}

export interface Exercise {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface SubSection {
  id: string;
  title: string;
  vocabulary: Vocabulary[];
  dialogs: Dialog[];
  exercises: Exercise[];
}

export interface Level {
  id: string;
  title: string;
  description: string;
  subSections: SubSection[];
}

// --- FUNGSI PENGGANTI (AMBIL DARI SUPABASE) ---
// Gunakan fungsi ini di halaman (Index/LevelPage) untuk mendapatkan data "levels" yang asli
export const getLevelsFromDB = async (): Promise<Level[]> => {
  try {
    // 1. Ambil semua data dari tabel levels
    const { data: levelsData, error: levelsError } = await supabase
      .from("levels")
      .select("*")
      .order("id", { ascending: true });

    if (levelsError) throw levelsError;
    if (!levelsData) return [];

    // 2. Ambil semua lessons beserta isinya (Join Table raksasa)
    // Note: Kita ambil semua sekaligus biar hemat request
    const { data: lessonsData, error: lessonsError } = await supabase
      .from("lessons")
      .select(`
        *,
        vocabularies(*),
        dialogs(*),
        exercises(*)
      `)
      .order("order_index", { ascending: true });

    if (lessonsError) throw lessonsError;

    // 3. Mapping Data Database -> Struktur 'Level' TypeScript
    const formattedLevels: Level[] = levelsData.map((lvl: any) => {
      // Filter lesson yang punya level_id sesuai level ini
      const relevantLessons = lessonsData?.filter((l: any) => l.level_id === lvl.id) || [];

      // Format Lesson menjadi SubSection
      const subSections: SubSection[] = relevantLessons.map((lesson: any) => ({
        id: lesson.slug,
        title: lesson.title,
        vocabulary: lesson.vocabularies?.map((v: any) => ({
          german: v.german,
          indonesian: v.indonesian,
          example: v.example || "",
        })),
        dialogs: lesson.dialogs?.map((d: any) => ({
          title: d.title,
          lines: d.lines, // JSONB dari DB
        })),
        exercises: lesson.exercises?.map((e: any) => ({
          question: e.question,
          options: e.options,
          correctAnswer: e.correct_answer, // Perhatikan snake_case dari DB
        })),
      }));

      return {
        id: lvl.id,
        title: lvl.title,
        description: lvl.description,
        subSections: subSections,
      };
    });

    return formattedLevels;

  } catch (error) {
    console.error("Gagal mengambil data levels:", error);
    return [];
  }
};

// --- FUNGSI HELPER LAMA (DISESUAIKAN) ---
// Fungsi ini sekarang tidak bisa bekerja sinkronus dengan variabel 'levels' yang kosong.
// Sebaiknya gunakan logic di 'FlashcardPage' yang mengambil langsung dari DB.
export const getFlashcardsForLevel = (levelId: string): Vocabulary[] => {
  console.warn("Fungsi getFlashcardsForLevel deprecated. Gunakan fetch dari DB langsung.");
  return [];
};

export const getAllFlashcards = (): { levelId: string; vocabulary: Vocabulary }[] => {
  console.warn("Fungsi getAllFlashcards deprecated. Gunakan fetch dari DB langsung.");
  return [];
};