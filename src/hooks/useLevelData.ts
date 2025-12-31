// src/hooks/useLevelData.ts

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useLevelData = (levelId: string | undefined) => {
  const [level, setLevel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!levelId) return;

    const fetchLevelData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Data Level Utama
        const { data: levelData, error: levelError } = await supabase
          .from("levels")
          .select("*")
          .eq("id", levelId)
          .single();

        if (levelError) throw levelError;

        // 2. Ambil Semua Sub-Bab (Lessons) beserta isinya
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select(`
            *,
            vocabularies(*),
            exercises(*),
            dialogs(
              *, 
              dialog_lines(*) 
            )
          `) // ^^^ PERHATIKAN BAGIAN DIALOGS INI. HARUS NESTED! ^^^
          .eq("level_id", levelId)
          .order("order_index");

        if (lessonsError) throw lessonsError;

        // Gabungkan data
        setLevel({ ...levelData, subSections: lessonsData });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLevelData();
  }, [levelId]);

  return { level, loading, error };
};