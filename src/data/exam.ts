export type QuestionType = "multiple-choice" | "true-false" | "text-input" | "essay" | "speaking";

export interface ExamQuestion {
  id: number;
  section: "Hören" | "Lesen" | "Schreiben" | "Sprechen";
  part: string;
  type: QuestionType;
  instruction: string;
  context?: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  sampleAnswer?: string;
  audioText?: string;
  explanation: string;
  keywords?: string[]; // Kata kunci untuk AI Checker
}

// --- DATA UJIAN LEVEL A1 (LENGKAP) ---
const a1_questions: ExamQuestion[] = [
  // HÖREN
  {
    id: 1,
    section: "Hören",
    part: "Teil 1",
    type: "multiple-choice",
    instruction: "Dengarkan percakapan dan pilih jawaban yang benar.",
    audioText: "Entschuldigung, wann fährt der Zug nach München? - Gleich, um zehn Uhr fünfzehn. - Oh danke. Und wann kommt er an? - Um zwölf Uhr dreißig.",
    question: "Wann fährt der Zug ab?",
    options: ["10:15 Uhr", "10:50 Uhr", "12:30 Uhr"],
    correctAnswer: "10:15 Uhr",
    explanation: "Pria tersebut mengatakan 'um 10:15 Uhr'."
  },
  {
    id: 2,
    section: "Hören",
    part: "Teil 1",
    type: "multiple-choice",
    instruction: "Dengarkan pesan telepon ini.",
    audioText: "Hallo Julia, hier ist Sarah. Der Film fängt erst um 20 Uhr an. Wir treffen uns also um 19:30 vor dem Kino. Bis dann!",
    question: "Wann treffen sie sich?",
    options: ["19:00 Uhr", "19:30 Uhr", "20:00 Uhr"],
    correctAnswer: "19:30 Uhr",
    explanation: "Lisa bilang dia terlambat 20 menit, jadi dia tiba jam 19:30."
  },
  
  // LESEN
  {
    id: 3,
    section: "Lesen",
    part: "Teil 1",
    type: "true-false",
    instruction: "Baca email berikut. Tentukan Benar (Richtig) atau Salah (Falsch).",
    context: "Liebe Maria,\ndanke für die Einladung. Ich komme gern, aber ich kann keinen Kuchen mitbringen. Mein Ofen ist kaputt. Soll ich Getränke kaufen?\nLiebe Grüße, Tina",
    question: "Tina bringt einen Kuchen mit.",
    options: ["Richtig", "Falsch"],
    correctAnswer: "Falsch",
    explanation: "Ada kata 'keinen' (tidak). Dia tidak bisa membawa kue."
  },
  {
    id: 4,
    section: "Lesen",
    part: "Teil 2",
    type: "true-false",
    instruction: "Baca papan pengumuman.",
    context: "ACHTUNG: Aufzug außer Betrieb. Bitte benutzen Sie die Treppe.",
    question: "Man kann den Aufzug benutzen.",
    options: ["Richtig", "Falsch"],
    correctAnswer: "Falsch",
    explanation: "'Außer Betrieb' artinya rusak/tidak beroperasi."
  },

  // SCHREIBEN
  {
    id: 5,
    section: "Schreiben",
    part: "Teil 1: Formular",
    type: "text-input",
    instruction: "Lengkapi formulir ini. Tulis jawabannya saja.",
    context: "Data: Eva Müller, wohnt in Berlin, bezahlt bar.",
    question: "Wohnort (Kota Tempat Tinggal):",
    correctAnswer: "Berlin",
    explanation: "Jelas tertulis 'wohnt in Berlin'."
  },
  {
    id: 6,
    section: "Schreiben",
    part: "Teil 1: Formular",
    type: "text-input",
    instruction: "Lengkapi formulir ini.",
    context: "Data: Eva Müller, wohnt in Berlin, bezahlt bar.",
    question: "Familienname (Nama Belakang):",
    correctAnswer: "Müller",
    explanation: "Eva adalah nama depan, Müller adalah nama belakang."
  },
  {
    id: 7,
    section: "Lesen",
    part: "Teil 1: Briefe/E-Mails",
    type: "true-false",
    instruction: "Baca email dari Monika lagi.",
    context: "Hallo Sarah,\nam Samstag mache ich eine Party. Ich lade dich herzlich ein. Wir fangen um 19 Uhr an. Kannst du bitte einen Salat mitbringen? Getränke habe ich genug.\nLiebe Grüße, Monika",
    question: "Die Party beginnt am Samstagabend.",
    options: ["Richtig", "Falsch"],
    correctAnswer: "Richtig",
    explanation: "Tertulis 'am Samstag' dan '19 Uhr' (jam 7 malam), jadi benar Sabtu malam."
  },

  // LESEN TEIL 2
  {
    id: 8,
    section: "Lesen",
    part: "Teil 2: Anzeigen (Iklan)",
    type: "multiple-choice",
    instruction: "Situasi: Anda ingin belajar bermain gitar di akhir pekan.",
    context: "IKLAN A: 'Musikschule Müller - Gitarrenkurse von Montag bis Freitag.'\nIKLAN B: 'Student gibt Gitarrenunterricht am Samstag und Sonntag.'",
    question: "Welche Anzeige passt?",
    options: ["Anzeige A", "Anzeige B"],
    correctAnswer: "Anzeige B",
    explanation: "Anda ingin belajar di 'akhir pekan' (Wochenende). Iklan A hanya Senin-Jumat. Iklan B menawarkan Sabtu-Minggu."
  },
  {
    id: 9,
    section: "Lesen",
    part: "Teil 2: Anzeigen (Iklan)",
    type: "multiple-choice",
    instruction: "Situasi: Anda mencari apartemen murah di pusat kota.",
    context: "IKLAN A: '3-Zimmer-Wohnung im Zentrum, 1200 Euro.'\nIKLAN B: 'Kleines Apartment am Stadtrand (Pinggiran), sehr billig, 300 Euro.'",
    question: "Welche Anzeige passt?",
    options: ["Anzeige A", "Anzeige B", "Tidak ada yang cocok"],
    correctAnswer: "Tidak ada yang cocok",
    explanation: "Jebakan! Iklan A di pusat kota tapi mahal. Iklan B murah tapi di pinggiran. Sesuai kriteria 'Murah & Pusat Kota', tidak ada yang cocok."
  },

  // LESEN TEIL 3
  {
    id: 10,
    section: "Lesen",
    part: "Teil 3: Schilder (Papan Tanda)",
    type: "true-false",
    instruction: "Baca papan tanda di pintu toko.",
    context: "MITTAGSPAUSE: 12:00 - 13:00 Uhr.",
    question: "Man kann um 12:30 Uhr einkaufen.",
    options: ["Richtig", "Falsch"],
    correctAnswer: "Falsch",
    explanation: "Mittagspause artinya Istirahat Siang (Toko Tutup). Jadi jam 12:30 tidak bisa belanja."
  },

  // SCHREIBEN EMAIL
  {
    id: 11,
    section: "Schreiben",
    part: "Teil 2: Email Menulis",
    type: "essay",
    instruction: "Anda ingin liburan ke Hotel 'Sonne' di Munich pada bulan Agustus. Tulis email dan tanyakan: 1. Harga kamar, 2. Boleh bawa anjing?",
    context: "Tulis di kertas dulu, lalu salin jawabanmu di sini untuk diperiksa AI.",
    question: "Tulis email Anda:",
    sampleAnswer: "Sehr geehrte Damen und Herren,\n\nich möchte im August zu Ihnen kommen. Wie viel kostet ein Zimmer? Darf ich meinen Hund mitbringen?\n\nMit freundlichen Grüßen",
    explanation: "Email formal harus punya sapaan 'Sehr geehrte...' dan penutup 'Mit freundlichen Grüßen'.",
    keywords: ["sehr geehrte", "august", "kostet", "hund", "grüßen"] 
  },

  // SPRECHEN
  {
    id: 12,
    section: "Sprechen",
    part: "Teil 1: Vorstellung",
    type: "speaking",
    instruction: "Perkenalkan diri Anda! Sebutkan Nama, Umur, Asal, dan Profesi.",
    question: "Tekan tombol Mikrofon dan bicaralah...",
    sampleAnswer: "Hallo, mein Name ist [Nama]. Ich bin [Umur] Jahre alt. Ich komme aus Indonesien. Ich bin [Profesi] von Beruf.",
    explanation: "Poin penting: Name, Alter (Jahre alt), Herkunft (aus...), Beruf.",
    keywords: ["name", "jahre", "komme", "bin"]
  },
  {
    id: 13,
    section: "Sprechen",
    part: "Teil 2: Permintaan (Bitten)",
    type: "speaking",
    instruction: "Mintalah segelas air kepada teman Anda.",
    question: "Apa yang Anda ucapkan?",
    sampleAnswer: "Kann ich bitte ein Glas Wasser haben?",
    explanation: "Selalu gunakan kata 'Bitte' (Tolong).",
    keywords: ["bitte", "wasser", "haben"]
  }
];

// --- DATA UJIAN LEVEL A2 (CONTOH) ---
const a2_questions: ExamQuestion[] = [
  {
    id: 1,
    section: "Lesen",
    part: "Teil 1",
    type: "multiple-choice",
    instruction: "Baca email berikut.",
    context: "Hallo Tom, ich habe am Samstag Geburtstag. Ich mache eine Party. Kommst du?",
    question: "Was feiert die Person?",
    options: ["Hochzeit", "Geburtstag", "Abschied"],
    correctAnswer: "Geburtstag",
    explanation: "Jelas tertulis 'Geburtstag' (Ulang Tahun)."
  }
];

// --- DATA UJIAN LEVEL B1 (CONTOH) ---
const b1_questions: ExamQuestion[] = [
    {
      id: 1,
      section: "Lesen",
      part: "Teil 1",
      type: "true-false",
      instruction: "Baca Blog berikut.",
      context: "Blogpost: Reisen macht Spaß, aber es ist auch sehr teuer. Ich bleibe lieber zu Hause.",
      question: "Der Autor findet Reisen billig.",
      options: ["Richtig", "Falsch"],
      correctAnswer: "Falsch",
      explanation: "Teuer artinya Mahal, bukan Billig (Murah)."
    }
];

// --- EXPORT UTAMA (DICTIONARY) ---
export const exams: Record<string, ExamQuestion[]> = {
  "A1": a1_questions,
  "A2": a2_questions,
  "B1": b1_questions,
  "B2": [], // Placeholder kosong
};