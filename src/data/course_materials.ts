import { supabase } from "@/lib/supabase";

// --- TIPE DATA (YANG SUDAH DIPERBAIKI) ---

// 1. Definisi Text
export type TextBlock = { 
  type: "text"; 
  content: string; 
};

// 2. Definisi Table
export type TableBlock = { 
  type: "table"; 
  headers: string[]; 
  rows: string[][]; 
};

// 3. Definisi Image (Ini yang kemarin bikin error)
export type ImageBlock = { 
  type: "image"; 
  src: string; 
  alt?: string; 
};

// 4. Gabungkan Semuanya
export type ContentBlock = TextBlock | TableBlock | ImageBlock;

export type ResourceLink = {
  title: string;
  url: string;
  type: "video" | "pdf" | "audio" | "web";
};

export interface MaterialSection {
  id: string;
  title: string;
  content: ContentBlock[]; 
  tips?: string[];
  resources?: ResourceLink[];
}

export interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  sections: MaterialSection[];
}

// --- FUNGSI FETCHER DARI DATABASE ---
export const getCourseMaterialsFromDB = async (levelId: string): Promise<CourseMaterial | null> => {
  try {
    const { data, error } = await supabase
      .from("course_materials")
      .select("*")
      .eq("level_id", levelId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching materials:", error);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Info Level (Manual Mapping)
    const levelInfo: Record<string, { title: string; desc: string }> = {
      "A1": { title: "Materi A1 - Pemula (Beginner)", desc: "Pondasi utama bahasa Jerman: Cara baca, struktur kalimat, grammar dasar." },
      "A2": { title: "Materi A2 - Dasar Lanjutan", desc: "Level Survival. Menceritakan masa lalu dan kalimat majemuk." },
      "B1": { title: "Materi B1 - Menengah", desc: "Menuju kefasihan. Struktur kalimat kompleks dan diskusi abstrak." },
      "B2": { title: "Materi B2 - Expert", desc: "Bahasa tingkat tinggi, nuansa, dan gaya bahasa akademis." },
    };

    const info = levelInfo[levelId] || { title: `Materi ${levelId}`, desc: "Materi pembelajaran." };

    // Rakit Object CourseMaterial
    const result: CourseMaterial = {
      id: levelId,
      title: info.title,
      description: info.desc,
      sections: data.map((item: any) => ({
        id: item.section_id,
        title: item.title,
        content: item.content, 
        tips: item.tips,
        resources: item.resources
      }))
    };

    return result;

  } catch (err) {
    console.error(err);
    return null;
  }
};