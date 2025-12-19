export interface Requirement {
  id: string;
  label: string;
  note?: string;
}

export interface UsefulLink {
  label: string;
  url: string;
  description: string;
}

export interface ProgramDetail {
  id: string;
  title: string;
  category?: string; // health, tech, business, gastro, craft, logistics, science
  description: string;
  salary: string;
  duration: string;
  source?: string;
  whatYouLearn: string[];
  requirements: Requirement[];
  usefulLinks?: UsefulLink[];
}

export const programs: Record<string, ProgramDetail> = {
// ==========================================
  // --- 1. JALUR NON-AUSBILDUNG ---
  // ==========================================
  aupair: {
    id: "aupair",
    title: "Au Pair",
    description: "Program pertukaran budaya tinggal bersama keluarga Jerman (Gastfamilie). Anda membantu mengasuh anak dan pekerjaan rumah ringan (maks. 30 jam/minggu) sambil belajar bahasa dan budaya Jerman secara langsung.",
    salary: "€280/bulan (Uang Saku Wajib) + Subsidi Kursus Bahasa €70/bulan",
    duration: "6 - 12 Bulan (Maksimal 1 Tahun)",
    whatYouLearn: ["Bahasa Jerman Sehari-hari (Alltagssprache)", "Budaya & Kebiasaan Keluarga Jerman", "Kemandirian & Tanggung Jawab", "Pengasuhan Anak (Kinderbetreuung)"],
    requirements: [
      { id: "ap_pass", label: "Paspor Asli", note: "Masa berlaku min. 1 tahun + 2 halaman kosong" },
      { id: "ap_a1", label: "Sertifikat Bahasa A1", note: "Wajib Goethe Institut / ÖSD (Start Deutsch 1)" },
      { id: "ap_cv", label: "Lebenslauf (CV)", note: "Format Tabel Jerman, Foto Senyum Ramah" },
      { id: "ap_mot", label: "Motivationsschreiben", note: "Surat personal untuk Gastfamilie (Dear Family...)" },
      { id: "ap_contract", label: "Au Pair Vertrag", note: "Kontrak resmi RAL (Gütecemeinschaft) bertanda tangan asli" },
      { id: "ap_ins", label: "Bukti Asuransi Kesehatan", note: "Wajib dibayarkan penuh oleh Gastfamilie" },
      { id: "ap_inv", label: "Surat Undangan (Einladung)", note: "Ditandatangani Gastfamilie" },
      { id: "ap_form", label: "Formulir Visa Nasional", note: "Diisi via VIDEX (Web Kedutaan)" },
      { id: "ap_foto", label: "Foto Kolase", note: "Dokumentasi kegiatan bersama anak-anak (Nilai Plus)" }
    ],
    usefulLinks: [
      { label: "AuPairWorld", url: "https://www.aupairworld.com", description: "Portal pencarian Au Pair terbesar & terpopuler di dunia." },
      { label: "AuPair.com", url: "https://www.aupair.com", description: "Alternatif situs pencarian keluarga." },
      { label: "Nina.care", url: "https://www.nina.care", description: "Agensi Au Pair terpercaya dengan support sistem yang baik." },
      { label: "Guetegemeinschaft Au Pair", url: "https://www.guetegemeinschaft-aupair.de/", description: "Standar resmi kontrak dan hak Au Pair di Jerman." },
      { label: "Kedutaan Jerman (Visa Au Pair)", url: "https://jakarta.diplo.de/id-id/service/visa-einreise/au-pair/2513904", description: "Syarat & ketentuan resmi pengajuan visa." }
    ]
  },
  fsj: {
    id: "fsj",
    title: "FSJ / BFD (Sosial)",
    description: "Freiwilliges Soziales Jahr (FSJ) atau Bundesfreiwilligendienst (BFD). Kerja sosial sukarela di Panti Lansia, Rumah Sakit, TK, atau Sekolah Luar Biasa. Sangat baik untuk meningkatkan bahasa sebelum Ausbildung/Kuliah.",
    salary: "€400 - €550/bulan (Taschengeld) + Akomodasi & Verpflegung (Makan)",
    duration: "12 - 18 Bulan",
    whatYouLearn: ["Empati & Kepekaan Sosial", "Bahasa Jerman Lingkungan Kerja", "Sistem Perawatan Jerman", "Disiplin Kerja"],
    requirements: [
      { id: "fsj_pass", label: "Paspor Asli", note: "Masa berlaku min. 18 bulan" },
      { id: "fsj_b1", label: "Sertifikat Bahasa B1", note: "Goethe/ÖSD/Telc (Sangat Disarankan agar lolos wawancara)" },
      { id: "fsj_cv", label: "Lebenslauf (CV)", note: "Highlight pengalaman organisasi/sosial/volunteering" },
      { id: "fsj_mot", label: "Motivationsschreiben", note: "Jelaskan alasan kuat memilih bidang sosial" },
      { id: "fsj_ijazah", label: "Ijazah Terakhir + Transkrip", note: "Translate Tersumpah (Sworn)" },
      { id: "fsj_contract", label: "FSJ/BFD Vereinbarung", note: "Kontrak resmi dari Träger & Einsatzstelle" },
      { id: "fsj_zav", label: "Persetujuan ZAV", note: "Surat izin dari Jobcenter (Wajib untuk Visa)" },
      { id: "fsj_visa", label: "Formulir Visa Nasional", note: "2 Rangkap" }
    ],
    usefulLinks: [
      { label: "Ein Jahr Freiwillig", url: "https://www.ein-jahr-freiwillig.de", description: "Portal pencarian FSJ/BFD Protestan (Diakonie)." },
      { label: "Caritas (Katolik)", url: "https://www.caritas.de/spendeundengagement/engagieren/freiwilligendienste/fsj/fsj", description: "Lowongan FSJ di institusi Katolik." },
      { label: "DRK (Palang Merah)", url: "https://www.drk.de/mitwirken/freiwilligendienste/", description: "FSJ di Palang Merah Jerman (Red Cross)." },
      { label: "Bundesfreiwilligendienst", url: "https://www.bundesfreiwilligendienst.de", description: "Website resmi program BFD pemerintah." },
      { label: "IJGD", url: "https://www.ijgd.de", description: "Organisasi layanan sukarela internasional." }
    ]
  },
  foj: {
    id: "foj",
    category: "social",
    title: "FÖJ (Lingkungan)",
    description: "Freiwilliges Ökologisches Jahr. Sukarelawan di bidang pelestarian alam, pertanian organik, kehutanan, atau konservasi hewan. Cocok bagi pecinta alam yang ingin kerja outdoor.",
    salary: "€350 - €450/bulan + Akomodasi",
    duration: "12 Bulan",
    source: "foj.de",
    whatYouLearn: ["Pertanian Organik", "Konservasi Alam & Hewan", "Kerja Fisik Outdoor", "Sustainability"],
    requirements: [
      { id: "foj_pass", label: "Paspor Asli", note: "Masa berlaku min. 1.5 tahun" },
      { id: "foj_b1", label: "Sertifikat B1", note: "Komunikasi aktif penting" },
      { id: "foj_cv", label: "CV (Minat Alam)", note: "Suka berkebun/pecinta alam" },
      { id: "foj_mot", label: "Motivation Letter", note: "Isu lingkungan yang diminati" },
      { id: "foj_contract", label: "Kontrak Träger FOJ", note: "Wajib ada Träger resmi" }
    ],
    usefulLinks: [
      { label: "FÖJ.de", url: "https://foej.de", description: "Portal utama informasi FÖJ nasional." },
      { label: "Oeko-jobs", url: "https://www.oeko-jobs.de", description: "Pencarian lowongan kerja/sukarelawan ekologis." },
      { label: "Träger FÖJ List", url: "https://foej.de/traeger/", description: "Daftar penyelenggara FÖJ per negara bagian." }
    ]
  },
  studienkolleg: {
    id: "studienkolleg",
    title: "Studienkolleg",
    description: "Kelas persiapan akademik (Foundation Year) selama 2 semester untuk lulusan SMA Indonesia sebelum masuk Universitas Jerman. Ujian akhir disebut Feststellungsprüfung (FSP).",
    salary: "Biaya Sendiri (Block Account)",
    duration: "1 Tahun (2 Semester)",
    whatYouLearn: ["Bahasa Jerman Akademik", "Matematika/Sains (T-Kurs/M-Kurs)", "Ekonomi (W-Kurs)", "Sosial (G-Kurs)"],
    requirements: [
      { id: "sk_pass", label: "Paspor Asli", note: "Berlaku min. 1 tahun" },
      { id: "sk_b2", label: "Sertifikat Bahasa B2", note: "Syarat mutlak Aufnahmeprüfung" },
      { id: "sk_ijazah", label: "Ijazah & SKHUN", note: "Legalisir Kedubes & Translate" },
      { id: "sk_zul", label: "Zulassungsbescheid", note: "Undangan tes dari Univ/Studkol" },
      { id: "sk_block", label: "Blocked Account", note: "Bukti dana €11.904 (2024)" },
      { id: "sk_ins", label: "Asuransi Kesehatan", note: "Travel Insurance / Public Health Insurance" }
    ],
    usefulLinks: [
      { label: "Studienkollegs.de", url: "http://www.studienkollegs.de", description: "Daftar seluruh Studienkolleg negeri & swasta." },
      { label: "Uni-Assist", url: "https://www.uni-assist.de", description: "Portal pendaftaran terpusat untuk mahasiswa asing." },
      { label: "DAAD Indonesia", url: "https://www.daad.id", description: "Info beasiswa dan panduan studi resmi." }
    ]
  },
  studium: {
    id: "studium",
    title: "Studium (Kuliah S1)",
    description: "Program Sarjana (Bachelor) di Universitas Jerman. Umumnya gratis SPP (kecuali Baden-Württemberg & Bayern tertentu), fokus pada teori dan riset. Lulusan memiliki peluang karir global.",
    salary: "Biaya Sendiri / Werkstudent",
    duration: "3 - 4 Tahun",
    whatYouLearn: ["Teori Akademik Mendalam", "Metodologi Riset", "Kemandirian Belajar", "Critical Thinking"],
    requirements: [
      { id: "stu_pass", label: "Paspor Asli" },
      { id: "stu_c1", label: "Sertifikat C1 / TestDaF", note: "TestDaF 4x4 atau DSH-2" },
      { id: "stu_aps", label: "Sertifikat APS", note: "Validasi ijazah (Wajib)" },
      { id: "stu_hzb", label: "Abitur / Feststellungsprüfung", note: "Lulus Studienkolleg" },
      { id: "stu_loa", label: "Letter of Acceptance (LoA)", note: "Bukti diterima universitas" },
      { id: "stu_block", label: "Blocked Account", note: "Dana jaminan hidup per tahun" }
    ],
    usefulLinks: [
      { label: "Study in Germany", url: "https://www.study-in-germany.de", description: "Panduan lengkap kuliah di Jerman." },
      { label: "Hochschulkompass", url: "https://www.hochschulkompass.de", description: "Mesin pencari jurusan kuliah terlengkap." },
      { label: "TestDaF", url: "https://www.testdaf.de", description: "Info ujian bahasa untuk kuliah." }
    ]
  },
  sprachschule: {
    id: "sprachschule",
    title: "Kursus Bahasa",
    description: "Visa khusus belajar bahasa intensif di Jerman (tanpa izin kerja). Cocok untuk persiapan tes C1/TestDaF atau persiapan Studienkolleg.",
    salary: "Biaya Sendiri",
    duration: "6 - 12 Bulan",
    whatYouLearn: ["Bahasa Jerman Intensif", "Persiapan Ujian (DSH/TestDaF)"],
    requirements: [
      { id: "spr_pass", label: "Paspor Asli" },
      { id: "spr_daftar", label: "Bukti Pendaftaran Kursus", note: "Minimal 18 jam pelajaran/minggu" },
      { id: "spr_bayar", label: "Bukti Pembayaran", note: "Kwitansi lunas dari tempat kursus" },
      { id: "spr_cv", label: "Lebenslauf & Motivasi", note: "Kenapa harus belajar di Jerman?" },
      { id: "spr_block", label: "Blocked Account", note: "Jaminan hidup selama kursus" }
    ],
    usefulLinks: [
      { label: "Goethe Institut", url: "https://www.goethe.de", description: "Lembaga bahasa Jerman resmi." },
      { label: "Fremdsprachen und Auslandskunde", url: "https://www.fadaf.de", description: "Asosiasi bahasa Jerman sebagai bahasa asing." }
    ]
  },
  // ==========================================
  // --- 2. AUSBILDUNG GENERAL (BASE DATA) ---
  // ==========================================
  aus_general: {
    id: "aus_general",
    title: "Info Umum Ausbildung",
    description: "Sistem pendidikan vokasi ganda (Duale Ausbildung) Jerman yang diakui dunia. Kamu belajar teori di sekolah (Berufsschule) 1-2 hari dan praktek kerja di perusahaan 3-4 hari. Mendapat gaji bulanan sejak hari pertama!",
    salary: "€900 - €1.300/bulan (Tergantung Jurusan & Wilayah)",
    duration: "2.5 - 3.5 Tahun",
    whatYouLearn: ["Keahlian Praktis Industri", "Etos Kerja Jerman", "Kemandirian Finansial"],
    requirements: [],
    usefulLinks: [
      { label: "Ausbildung.de", url: "https://www.ausbildung.de", description: "Portal pencarian terbesar dengan UI modern & tes minat bakat." },
      { label: "Azubiyo", url: "https://www.azubiyo.de", description: "Mencocokkan profilmu dengan perusahaan yang pas." },
      { label: "Bundesagentur für Arbeit", url: "https://jobboerse.arbeitsagentur.de", description: "Jobbörse resmi pemerintah. Data paling valid & lengkap." },
      { label: "Make it in Germany", url: "https://www.make-it-in-germany.com/en/study-training/training-in-germany", description: "Panduan resmi pemerintah untuk pelamar internasional." },
      { label: "Lehrstellen Radar", url: "https://www.lehrstellen-radar.de", description: "Aplikasi pencarian khusus bidang Handwerk (Teknik/Kerajinan)." },
      { label: "IHK Lehrstellenbörse", url: "https://www.ihk-lehrstellenboerse.de", description: "Lowongan resmi dari Kamar Dagang & Industri (IHK) seluruh Jerman." }
    ]
  },

  // ==========================================
  // --- KATEGORI: KESEHATAN (GESUNDHEIT) ---
  // ==========================================
  aus_pflege: {
    id: "aus_pflege",
    category: "health",
    title: "Pflegefachmann/frau (Perawat)",
    description: "Generalis perawatan medis. Profesi paling dicari di Jerman (Fachkräftemangel). Bekerja di RS, Panti Lansia (Altenheim), atau Perawatan Anak.",
    salary: "€1.340 - €1.503/bulan (Tertinggi di sektor Ausbildung)",
    duration: "3 Tahun",
    whatYouLearn: ["Perawatan Pasien Akut & Kronis", "Anatomi & Farmakologi", "Dokumentasi Medis Digital", "Manajemen Luka"],
    requirements: [
      { id: "pf_b2", label: "Sertifikat B2", note: "Wajib B2 lengkap (Goethe/Telc/ÖSD)" },
      { id: "pf_ijazah", label: "Ijazah SMA/SMK", note: "Semua jurusan bisa, IPA nilai plus" },
      { id: "pf_aner", label: "Anerkennung", note: "Penyetaraan ijazah (Zeugnisanerkennung)" },
      { id: "pf_mcu", label: "Medical Check Up", note: "Bebas penyakit menular, fisik kuat" },
      { id: "pf_masern", label: "Vaksin Campak", note: "Wajib 2 dosis (Masernschutz)" }
    ],
    usefulLinks: [
      { label: "Pflegeausbildung.net", url: "https://www.pflegeausbildung.net", description: "Info resmi pemerintah tentang reformasi pendidikan perawat." },
      { label: "Klinikum Lowongan", url: "https://www.kliniken.de", description: "Cari lowongan langsung di Rumah Sakit seluruh Jerman." },
      { label: "Altenpflege.de", url: "https://www.altenpflege.de", description: "Portal khusus lowongan perawatan lansia." },
      { label: "Diakonie Karir", url: "https://karriere.diakonie.de/ausbildung-in-der-pflege", description: "Lowongan di institusi kesehatan gereja Protestan (sangat banyak)." },
      { label: "Caritas Karir", url: "https://www.caritas.de/spendeundengagement/engagieren/ausbildung", description: "Lowongan di institusi kesehatan Katolik." }
    ]
  },
  aus_ata: {
    id: "aus_ata",
    category: "health",
    title: "Anästhesietechnische Assistenten (ATA)",
    description: "Spesialis ruang operasi. Mempersiapkan alat bius, obat-obatan, dan memantau tanda vital pasien bersama dokter anestesi.",
    salary: "€1.190 - €1.350/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Teknologi Mesin Anestesi", "Farmakologi Obat Bius", "Manajemen Nyeri", "Protokol Steril Kamar Operasi"],
    requirements: [
      { id: "ata_b2", label: "Sertifikat B2", note: "Komunikasi kritis & cepat di ruang OK" },
      { id: "ata_bio", label: "Nilai Bio/Kimia", note: "Wajib di atas rata-rata" },
      { id: "ata_praktikum", label: "Bukti Magang", note: "Pengalaman RS sangat diutamakan" },
      { id: "ata_teliti", label: "Ketelitian Tinggi", note: "Salah dosis obat = fatal" }
    ],
    usefulLinks: [
      { label: "DKG (Asosiasi RS)", url: "https://www.dkgev.de", description: "Standar pelatihan & karir di Rumah Sakit Jerman." },
      { label: "Kimeta ATA", url: "https://www.kimeta.de/ausbildung-ata", description: "Mesin pencari khusus lowongan ATA." },
      { label: "Operation Karriere", url: "https://www.operation-karriere.de", description: "Portal karir medis & kesehatan." }
    ]
  },
  aus_physio: {
    id: "aus_physio",
    category: "health",
    title: "Physiotherapeut/in",
    description: "Terapis fisik untuk rehabilitasi pasien pasca kecelakaan, stroke, atau cedera olahraga.",
    salary: "€1.065 - €1.250/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Anatomi Otot & Tulang", "Teknik Pijat & Manual Therapy", "Rehabilitasi Gerak", "Penggunaan Alat Terapi"],
    requirements: [
      { id: "phy_b2", label: "Sertifikat B2", note: "Instruksi ke pasien harus jelas" },
      { id: "phy_fisik", label: "Fisik Prima", note: "Pekerjaan fisik berat (memijat/mengangkat)" },
      { id: "phy_bio", label: "Biologi Tubuh Manusia", note: "Paham sistem gerak" }
    ],
    usefulLinks: [
      { label: "Physio Deutschland", url: "https://www.physio-deutschland.de", description: "Asosiasi Fisioterapi Jerman." },
      { label: "Therapie Jobs", url: "https://www.therapie.de/psychotherapeutensuche/", description: "Cari klinik terapi & rehabilitasi." }
    ]
  },
  aus_mfa: {
    id: "aus_mfa",
    category: "health",
    title: "Medizinische Fachangestellte (MFA)",
    description: "Asisten dokter di klinik praktek (Praxis). Gabungan tugas medis ringan (suntik/EKG) dan administrasi (resepsionis/surat).",
    salary: "€960 - €1.100/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Manajemen Pasien", "Pengambilan Darah/Vaksinasi", "Administrasi Asuransi", "Lab Dasar"],
    requirements: [
      { id: "mfa_b2", label: "Sertifikat B2", note: "Frontliner klinik, komunikasi utama" },
      { id: "mfa_org", label: "Organisasi", note: "Mengatur jadwal dokter & pasien" },
      { id: "mfa_empati", label: "Empati", note: "Menghadapi pasien sakit setiap hari" }
    ],
    usefulLinks: [
      { label: "Ärztekammer", url: "https://www.bundesaerztekammer.de", description: "Info resmi dari Ikatan Dokter Jerman." },
      { label: "MFA Jobs", url: "https://www.praktischarzt.de/medizinische-berufe/mfa/", description: "Portal khusus lowongan di praktek dokter." }
    ]
  },

  // ==========================================
  // --- KATEGORI: TEKNIK & IT (TECHNIK) ---
  // ==========================================
  aus_it_app: {
    id: "aus_it_app",
    category: "tech",
    title: "Fachinformatiker - App Dev",
    description: "Software Engineer. Membuat aplikasi, website, atau sistem backend. Sangat dibutuhkan di era digitalisasi Jerman.",
    salary: "€1.050 - €1.250/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Bahasa Pemrograman (Java, Python, C#, JS)", "Database (SQL)", "Software Testing", "Agile Methodology"],
    requirements: [
      { id: "it_b2", label: "B2 & Inggris", note: "Jerman B2 + Inggris Pasif lancar" },
      { id: "it_porto", label: "Portofolio (Github)", note: "Wajib punya project coding sendiri" },
      { id: "it_logika", label: "Logika Matematika", note: "Algoritma & Problem Solving" }
    ],
    usefulLinks: [
      { label: "Get in IT", url: "https://www.get-in-it.de/ausbildung", description: "Portal #1 khusus karir IT pemula." },
      { label: "IT-Berufe", url: "https://www.it-berufe.de", description: "Info detail semua jurusan IT." },
      { label: "SAP Ausbildung", url: "https://www.sap.com/germany/about/careers/university-programs/vocational-training.html", description: "Program di raksasa software SAP." },
      { label: "Deutsche Telekom", url: "https://www.telekom.com/de/karriere/schueler", description: "Provider internet terbesar, banyak lowongan IT." }
    ]
  },
  aus_it_sys: {
    id: "aus_it_sys",
    category: "tech",
    title: "Fachinformatiker - SysAdmin",
    description: "System Integration. Mengurus infrastruktur IT, server, jaringan, cloud, dan keamanan siber perusahaan.",
    salary: "€1.050 - €1.250/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Jaringan (LAN/WAN)", "Server (Linux/Windows)", "Cyber Security", "Virtualization"],
    requirements: [
      { id: "sys_b2", label: "Sertifikat B2" },
      { id: "sys_hw", label: "Hobi Hardware", note: "Suka rakit PC/ngoprek server" },
      { id: "sys_prob", label: "Troubleshooting", note: "Sabar mencari solusi error" }
    ],
    usefulLinks: [
      { label: "Heise Jobs", url: "https://www.heise.de/jobs/", description: "Portal kerja teknologi terpercaya." },
      { label: "Admin-Magazin", url: "https://www.admin-magazin.de", description: "Bacaan wajib SysAdmin." }
    ]
  },
  aus_kfz: {
    id: "aus_kfz",
    category: "tech",
    title: "Kfz-Mechatroniker (Mobil)",
    description: "Mekanik mobil modern. Bukan cuma ganti oli, tapi diagnosa komputer mobil, sistem hybrid/listrik, dan mekatronika.",
    salary: "€900 - €1.150/bulan",
    duration: "3.5 Tahun",
    whatYouLearn: ["Diagnosa ECU", "Sistem Rem & Suspensi", "E-Mobility (Mobil Listrik)", "Hydraulic & Pneumatic"],
    requirements: [
      { id: "kfz_b2", label: "Sertifikat B2", note: "Manual book bahasa teknis Jerman" },
      { id: "kfz_sim", label: "SIM A Manual", note: "Nilai plus besar (bisa test drive)" },
      { id: "kfz_fisik", label: "Fisik Kuat", note: "Kerja di bengkel (kotor & berat)" }
    ],
    usefulLinks: [
      { label: "Autoberufe.de", url: "https://www.autoberufe.de", description: "Portal resmi industri otomotif Jerman." },
      { label: "BMW Group Careers", url: "https://www.bmwgroup.jobs/de/en/students/vocational-training.html", description: "Halaman karir BMW." },
      { label: "Mercedes-Benz Training", url: "https://group.mercedes-benz.com/careers/pupils/dual-vocational-training/", description: "Info Ausbildung di Mercedes-Benz." },
      { label: "Volkswagen Karriere", url: "https://www.volkswagen-karriere.de/de/schueler/ausbildung.html", description: "Program vokasi di VW Group." }
    ]
  },
  aus_elektroniker: {
    id: "aus_elektroniker",
    category: "tech",
    title: "Elektroniker für Betriebstechnik",
    description: "Teknisi listrik industri. Menginstal, merawat, dan memperbaiki sistem kelistrikan mesin-mesin pabrik besar.",
    salary: "€1.000 - €1.250/bulan",
    duration: "3.5 Tahun",
    whatYouLearn: ["Instalasi Listrik Arus Kuat", "Sistem Kontrol (PLC)", "Maintenance Mesin", "K3 Listrik"],
    requirements: [
      { id: "ele_b2", label: "Sertifikat B2" },
      { id: "ele_warna", label: "Tes Buta Warna", note: "Wajib lolos (kabel warna-warni)" },
      { id: "ele_fisika", label: "Nilai Fisika/Math", note: "Paham arus, tegangan, hambatan" }
    ],
    usefulLinks: [
      { label: "E-Zubis", url: "https://www.e-zubis.de", description: "Info lengkap karir bidang elektro." },
      { label: "Siemens Ausbildung", url: "https://new.siemens.com/de/de/unternehmen/ausbildung.html", description: "Program pelatihan di raksasa teknologi Siemens." }
    ]
  },
  aus_zerspanung: {
    id: "aus_zerspanung",
    category: "tech",
    title: "Zerspanungsmechaniker (CNC)",
    description: "Operator mesin presisi (Bubut/Milling/CNC). Membuat komponen logam presisi mikron untuk mesin, pesawat, atau mobil.",
    salary: "€1.050 - €1.200/bulan",
    duration: "3.5 Tahun",
    whatYouLearn: ["Pemrograman CNC", "Membaca Gambar Teknik", "Pengolahan Logam", "Quality Control Presisi"],
    requirements: [
      { id: "zer_math", label: "Matematika Geometri", note: "Paham sudut & ukuran presisi" },
      { id: "zer_teliti", label: "Sangat Teliti", note: "Toleransi kesalahan mikrometer" },
      { id: "zer_fisik", label: "Fisik Kuat", note: "Berdiri lama di depan mesin" }
    ],
    usefulLinks: [
      { label: "Metall-Ausbildung", url: "https://www.metall-ausbildung.info", description: "Info industri logam & mesin." },
      { label: "ThyssenKrupp Karriere", url: "https://karriere.thyssenkrupp.com/de/schueler/ausbildung", description: "Karir di raksasa baja ThyssenKrupp." }
    ]
  },

  // ==========================================
  // --- KATEGORI: BISNIS (KAUFMÄNNISCH) ---
  // ==========================================
  aus_bank: {
    id: "aus_bank",
    category: "business",
    title: "Bankkaufmann/-frau",
    description: "Bankir profesional. Menangani layanan nasabah, kredit, investasi, dan manajemen akun di bank.",
    salary: "€1.150 - €1.300/bulan",
    duration: "2.5 - 3 Tahun",
    whatYouLearn: ["Sistem Keuangan Eropa", "Produk Investasi & Saham", "Analisis Kredit", "Akuntansi Bank"],
    requirements: [
      { id: "bk_c1", label: "Sertifikat C1", note: "Wajib! Bahasa hukum/bank sangat formal" },
      { id: "bk_math", label: "Nilai Ekonomi", note: "Suka angka & analisa" },
      { id: "bk_skck", label: "SKCK Bersih", note: "Kepercayaan adalah segalanya di bank" }
    ],
    usefulLinks: [
      { label: "Bankazubi.de", url: "https://www.bankazubi.de", description: "Komunitas & info khusus azubi bank." },
      { label: "Deutsche Bank Careers", url: "https://careers.db.com/students-graduates/apprenticeship/", description: "Program di Deutsche Bank." },
      { label: "Sparkasse Ausbildung", url: "https://www.sparkasse.de/karriere/ausbildung.html", description: "Jaringan bank daerah terbesar di Jerman." }
    ]
  },
  aus_buero: {
    id: "aus_buero",
    category: "business",
    title: "Kaufmann/-frau für Büromanagement",
    description: "Office Management. Mengurus surat-menyurat, jadwal meeting, pemesanan tiket, dan pembukuan dasar kantor.",
    salary: "€980 - €1.150/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["MS Office Expert (Excel/Word)", "Business Correspondence", "Organisasi Event Kantor", "Basic Accounting"],
    requirements: [
      { id: "bu_c1", label: "Sertifikat C1", note: "Menulis email & terima telepon lancar" },
      { id: "bu_org", label: "Skill Organisasi", note: "Rapi & terstruktur" },
      { id: "bu_komp", label: "Literasi Komputer", note: "Wajib lancar mengetik" }
    ],
    usefulLinks: [
      { label: "Büroberufe", url: "https://www.buerokaufmann-frau.de", description: "Info spesifik profesi manajemen kantor." }
    ]
  },
  aus_industrie_kauf: {
    id: "aus_industrie_kauf",
    category: "business",
    title: "Industriekaufmann/-frau",
    description: "Admin bisnis di perusahaan manufaktur (pabrik). Posisi prestisius yang mengurus rantai pasok, HR, hingga penjualan produk pabrik.",
    salary: "€1.050 - €1.250/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Supply Chain Management", "Cost Accounting", "HR Management", "B2B Sales"],
    requirements: [
      { id: "ik_c1", label: "Sertifikat C1", note: "Bahasa bisnis level tinggi" },
      { id: "ik_math", label: "Matematika/Ekonomi", note: "Nilai harus sangat baik" },
      { id: "ik_analis", label: "Analytical Thinking", note: "Memahami proses bisnis kompleks" }
    ],
    usefulLinks: [
      { label: "IHK Info", url: "https://www.ihk.de", description: "Info resmi Kamar Dagang & Industri." },
      { label: "Bosch Ausbildung", url: "https://www.bosch.de/karriere/schueler/", description: "Program di perusahaan teknik Bosch." }
    ]
  },

  // ==========================================
  // --- KATEGORI: HANDWERK & KONSTRUKSI ---
  // ==========================================
  aus_anlagen: {
    id: "aus_anlagen",
    category: "craft",
    title: "Anlagenmechaniker SHK (Plumbing)",
    description: "Teknisi Sanitasi, Pemanas, dan Pendingin (HVAC). Memasang pipa air, sistem pemanas ruangan (Heizung), dan solusi energi terbarukan.",
    salary: "€900 - €1.100/bulan",
    duration: "3.5 Tahun",
    whatYouLearn: ["Teknik Pipa & Las", "Sistem Pemanas Cerdas", "Energi Surya/Heat Pump", "Instalasi Kamar Mandi"],
    requirements: [
      { id: "shk_b1", label: "Sertifikat B1", note: "Cukup B1 asal paham teknis" },
      { id: "shk_fisik", label: "Fisik Kuat", note: "Angkat beban berat/kerja sempit" },
      { id: "shk_teknik", label: "Hobi Teknik", note: "Suka bongkar pasang alat" }
    ],
    usefulLinks: [
      { label: "Zeit zu Starten", url: "https://www.zeitzustarten.de", description: "Kampanye resmi profesi SHK Jerman." },
      { label: "Handwerk.de", url: "https://www.handwerk.de", description: "Portal utama semua profesi kerajinan tangan." }
    ]
  },
  aus_gleis: {
    id: "aus_gleis",
    category: "craft",
    title: "Gleisbauer/in (Rel Kereta)",
    description: "Spesialis konstruksi rel kereta api. Membangun, memperbaiki, dan merawat jaringan rel Deutsche Bahn. Kerja fisik berat dan outdoor.",
    salary: "€1.100 - €1.350/bulan (Gaji Awal Tinggi)",
    duration: "3 Tahun",
    whatYouLearn: ["Konstruksi Bantalan Rel", "Pengukuran Presisi", "Penggunaan Alat Berat", "Beton & Aspal"],
    requirements: [
      { id: "gl_b1", label: "Sertifikat B1" },
      { id: "gl_fisik", label: "Sehat Jasmani", note: "Sangat vital! Kerja di segala cuaca" },
      { id: "gl_tim", label: "Team Player", note: "Kerja tim sangat erat demi keselamatan" }
    ],
    usefulLinks: [
      { label: "Deutsche Bahn Karriere", url: "https://db.jobs/de-de/dein-einstieg/ausbildung", description: "Penyedia lowongan Gleisbauer terbesar." },
      { label: "Bauindustrie", url: "https://www.bauindustrie.de/themen/bildung-wissenschaft/bauberufe/gleisbauer", description: "Info industri konstruksi." }
    ]
  },
  aus_tischler: {
    id: "aus_tischler",
    category: "craft",
    title: "Tischler/in (Tukang Kayu)",
    description: "Pengrajin kayu profesional. Membuat furnitur custom, jendela, pintu, hingga desain interior kayu.",
    salary: "€850 - €1.050/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Jenis-jenis Kayu", "Teknik Potong & Sambung", "Desain Furnitur (CAD)", "Finishing"],
    requirements: [
      { id: "ti_b1", label: "Sertifikat B1" },
      { id: "ti_kreatif", label: "Kreativitas", note: "Punya sense of art" },
      { id: "ti_math", label: "Matematika", note: "Ukur presisi milimeter" },
      { id: "ti_porto", label: "Foto Karya", note: "Nilai plus jika pernah buat sesuatu" }
    ],
    usefulLinks: [
      { label: "Tischler Schreiner", url: "https://www.tischler-schreiner.de", description: "Asosiasi tukang kayu Jerman." },
      { label: "Born2BeTischler", url: "https://www.born2btischler.de", description: "Kampanye keren profesi kayu." }
    ]
  },
  aus_gaertner: {
    id: "aus_gaertner",
    category: "craft",
    title: "Gärtner/in (Tukang Kebun)",
    description: "Ahli pertamanan dan lanskap. Merancang taman kota, merawat tanaman hias, atau budidaya sayur/buah.",
    salary: "€900 - €1.100/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Botani & Hama", "Desain Lanskap", "Teknik Irigasi & Tanah", "Penggunaan Alat Kebun"],
    requirements: [
      { id: "ga_b1", label: "Sertifikat B1" },
      { id: "ga_alam", label: "Cinta Alam", note: "Tidak takut kotor/serangga" },
      { id: "ga_fisik", label: "Tahan Cuaca", note: "Kerja panas/hujan outdoor" },
      { id: "ga_alergi", label: "Bebas Alergi", note: "Tidak alergi serbuk sari" }
    ],
    usefulLinks: [
      { label: "Gärtner werden", url: "https://www.beruf-gaertner.de", description: "Info lengkap spesialisasi tukang kebun." },
      { label: "Galabau", url: "https://www.galabau.de", description: "Asosiasi Lansekap & Pertamanan." }
    ]
  },
  aus_baeckerei: {
    id: "aus_baeckerei",
    category: "craft",
    title: "Bäckereifachverkäufer/in",
    description: "Sales profesional di toko roti (Bäckerei). Menata display, membuat snack, dan melayani pelanggan dengan ramah.",
    salary: "€800 - €950/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Product Knowledge Roti", "Teknik Packing & Display", "Higiene Pangan", "Kasir & Service"],
    requirements: [
      { id: "bk_b1", label: "Sertifikat B1", note: "Komunikasi lisan sangat penting" },
      { id: "bk_ramah", label: "Friendly", note: "Wajib murah senyum" },
      { id: "bk_pagi", label: "Bangun Pagi", note: "Shift pagi mulai jam 5/6" },
      { id: "bk_health", label: "Rote Karte", note: "Sertifikat kesehatan pangan" }
    ],
    usefulLinks: [
      { label: "Back dir deine Zukunft", url: "https://www.back-dir-deine-zukunft.de", description: "Kampanye resmi industri roti Jerman." }
    ]
  },

  // ==========================================
  // --- KATEGORI: LOGISTIK & TRANSPORT ---
  // ==========================================
  aus_lager: {
    id: "aus_lager",
    category: "logistics",
    title: "Fachkraft für Lagerlogistik",
    description: "Manajer gudang profesional. Mengatur barang masuk/keluar, stok opname, dan pengiriman menggunakan software logistik.",
    salary: "€950 - €1.150/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Manajemen Stok & ERP", "Mengemudi Forklift", "Dokumen Ekspor/Impor", "Packing Barang"],
    requirements: [
      { id: "lag_b1", label: "Sertifikat B1", note: "Instruksi kerja jelas" },
      { id: "lag_teliti", label: "Ketelitian", note: "Salah hitung = rugi besar" },
      { id: "lag_fisik", label: "Fisik", note: "Siap angkat barang jika perlu" }
    ],
    usefulLinks: [
      { label: "Logistik Lernen", url: "https://www.logistik-lernen.de", description: "Materi belajar dunia logistik." },
      { label: "DHL Careers", url: "https://careers.dhl.com/global/en/students-graduates", description: "Program Ausbildung di DHL." },
      { label: "DB Schenker", url: "https://www.dbschenker.com/global/careers/students-graduates", description: "Program vokasi di DB Schenker." }
    ]
  },
  aus_driver: {
    id: "aus_driver",
    category: "logistics",
    title: "Berufskraftfahrer/in (Supir)",
    description: "Pengemudi profesional truk logistik atau bus penumpang. Bertanggung jawab atas kargo/penumpang dan teknis kendaraan.",
    salary: "€1.000 - €1.200/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["SIM Truk/Bus (C/D) Gratis", "Mekanika Kendaraan Dasar", "Aturan Lalu Lintas Eropa", "Logistik Rute"],
    requirements: [
      { id: "drv_b1", label: "Sertifikat B1" },
      { id: "drv_sim", label: "SIM A/B Indonesia", note: "Wajib bisa nyetir mobil dulu" },
      { id: "drv_mcu", label: "Tes Mata & Refleks", note: "Syarat mutlak keselamatan" }
    ],
    usefulLinks: [
      { label: "Beweg was", url: "https://www.beweg-was-werde-busfahrer.de", description: "Info karir supir bus." },
      { label: "Spedition Jobs", url: "https://www.spedition.de", description: "Portal logistik & transportasi." }
    ]
  },
  aus_eisenbahner: {
    id: "aus_eisenbahner",
    category: "logistics",
    title: "Eisenbahner (Masinis)",
    description: "Masinis kereta api (Lokführer). Mengemudikan kereta kargo atau penumpang, serta mengatur langsir gerbong.",
    salary: "€1.100 - €1.300/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Operasional Lokomotif", "Sinyal Kereta Api", "Peraturan Keselamatan", "Teknik Perkeretaapian"],
    requirements: [
      { id: "bahn_b2", label: "Sertifikat B2", note: "Komunikasi radio sangat teknis" },
      { id: "bahn_psiko", label: "Lulus Tes Psikologi", note: "Fokus, reaksi, & mental stabil" },
      { id: "bahn_mcu", label: "Tes Kesehatan Ketat", note: "Mata & pendengaran sempurna" }
    ],
    usefulLinks: [
      { label: "Deutsche Bahn", url: "https://db.jobs/de-de/dein-einstieg/ausbildung", description: "Penyedia lowongan kereta terbesar." },
      { label: "Bahnen NRW", url: "https://www.bahnen.nrw/karriere", description: "Karir kereta di wilayah NRW." }
    ]
  },

  // ==========================================
  // --- KATEGORI: HOTEL & RESTO (GASTRO) ---
  // ==========================================
  aus_hotel: {
    id: "aus_hotel",
    category: "gastro",
    title: "Hotelfachmann/frau",
    description: "All-rounder perhotelan. Menguasai semua departemen: Resepsionis (Front Office), Housekeeping, Restoran (F&B), hingga Event.",
    salary: "€1.000 - €1.150/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Sistem Reservasi Hotel", "Standar Housekeeping", "Table Manner & Service", "Manajemen Komplain"],
    requirements: [
      { id: "hot_b2", label: "Sertifikat B2", note: "Komunikasi tamu adalah kunci" },
      { id: "hot_eng", label: "Bahasa Inggris", note: "Wajib lancar" },
      { id: "hot_groom", label: "Penampilan", note: "Rapi, bersih, ramah (Hospitality)" }
    ],
    usefulLinks: [
      { label: "HOGAPAGE", url: "https://www.hogapage.de/jobs/ausbildung", description: "Portal lowongan Hotel & Gastro terbesar." },
      { label: "Marriott Careers", url: "https://jobs.marriott.com", description: "Karir di jaringan hotel internasional." },
      { label: "DEHOGA", url: "https://www.dehoga-bundesverband.de/ausbildung-karriere/", description: "Asosiasi Hotel & Restoran Jerman." }
    ]
  },
  aus_koch: {
    id: "aus_koch",
    category: "gastro",
    title: "Koch/Köchin (Koki)",
    description: "Seniman dapur. Menyiapkan bahan, memasak menu a la carte atau buffet, manajemen stok bahan, dan kalkulasi harga menu.",
    salary: "€950 - €1.100/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Teknik Potong & Masak", "Higiene Pangan (HACCP)", "Menu Engineering", "Kerja Tim Dapur"],
    requirements: [
      { id: "koch_b1", label: "Sertifikat B1", note: "Komunikasi dapur (Kitchen Language)" },
      { id: "koch_fisik", label: "Fisik Prima", note: "Berdiri lama, panas, stress tinggi" },
      { id: "koch_passion", label: "Passion Masak", note: "Bukan sekadar kerja, tapi seni" },
      { id: "koch_health", label: "Rote Karte", note: "Sertifikat kesehatan wajib" }
    ],
    usefulLinks: [
      { label: "Rolling Pin", url: "https://www.rollingpin.de/jobs", description: "Majalah & job board kuliner top." },
      { label: "Verband der Köche", url: "https://www.vkd.com", description: "Asosiasi Koki Jerman." }
    ]
  },
  aus_sys_gastro: {
    id: "aus_sys_gastro",
    category: "gastro",
    title: "Fachmann Systemgastronomie",
    description: "Manajemen restoran berkonsep sistem (Franchise seperti McDonald's, Starbucks, Vapiano). Fokus pada standar kualitas dan manajemen.",
    salary: "€1.000 - €1.150/bulan",
    duration: "3 Tahun",
    whatYouLearn: ["Manajemen Shift & SDM", "Quality Control Standar", "Marketing Lokal", "Pembukuan Resto"],
    requirements: [
      { id: "sys_b1", label: "Sertifikat B1" },
      { id: "sys_org", label: "Skill Organisasi", note: "Suka mengatur tim & jadwal" },
      { id: "sys_stress", label: "Tahan Stress", note: "Lingkungan kerja sangat cepat" }
    ],
    usefulLinks: [
      { label: "McDonald's Ausbildung", url: "https://www.mcdonalds.de/karriere/ausbildung", description: "Program di McD (Sangat terstruktur)." },
      { label: "Systemgastronomie", url: "https://www.bundesverband-systemgastronomie.de/de/berufsbild.html", description: "Info asosiasi gastronomi sistem." }
    ]
  },

  // ==========================================
  // --- KATEGORI: SAINS & LAB (SCIENCE) ---
  // ==========================================
  aus_chemie: {
    id: "aus_chemie",
    category: "science",
    title: "Chemielaborant/in",
    description: "Laboran kimia. Bekerja di industri farmasi, kosmetik, atau cat. Menganalisis zat, mensintesis bahan kimia, dan dokumentasi hasil lab.",
    salary: "€1.100 - €1.300/bulan (Sangat Baik)",
    duration: "3.5 Tahun",
    whatYouLearn: ["Analisis Kimia (Titrasi/Kromatografi)", "Penggunaan Instrumen Lab", "Sintesis Zat Organik/Anorganik", "Protokol Keamanan Lab"],
    requirements: [
      { id: "che_b2", label: "Sertifikat B2", note: "Bahasa ilmiah & laporan lab" },
      { id: "che_nilai", label: "Nilai Kimia/Fisika", note: "Wajib Bagus" },
      { id: "che_teliti", label: "Sangat Teliti", note: "Presisi timbangan miligram" }
    ],
    usefulLinks: [
      { label: "Elementare Vielfalt", url: "https://www.elementare-vielfalt.de", description: "Portal karir industri kimia Jerman." },
      { label: "Bayer Careers", url: "https://karriere.bayer.de/schueler", description: "Ausbildung di perusahaan farmasi Bayer." },
      { label: "BASF Ausbildung", url: "https://www.basf.com/global/de/careers/graduates/apprenticeship.html", description: "Program di perusahaan kimia terbesar dunia." }
    ]
  },
  aus_bio: {
    id: "aus_bio",
    category: "science",
    title: "Biologielaborant/in",
    description: "Laboran biologi. Melakukan riset pada sel, bakteri, tanaman, atau hewan uji untuk pengembangan obat atau bioteknologi.",
    salary: "€1.050 - €1.250/bulan",
    duration: "3.5 Tahun",
    whatYouLearn: ["Mikrobiologi & Kultur Sel", "Genetika (PCR/DNA)", "Farmakologi", "Hewan Percobaan (Opsional)"],
    requirements: [
      { id: "bio_b2", label: "Sertifikat B2" },
      { id: "bio_nilai", label: "Nilai Biologi", note: "Sangat penting" },
      { id: "bio_ijazah", label: "Ijazah SMA IPA", note: "Disarankan jurusan IPA" },
      { id: "bio_sabar", label: "Kesabaran", note: "Proses biologi butuh waktu" }
    ],
    usefulLinks: [
      { label: "VBio", url: "https://www.vbio.de/karriere/ausbildung", description: "Asosiasi Biologi Jerman." },
      { label: "Max Planck Society", url: "https://www.mpg.de/ausbildung", description: "Ausbildung di institut riset kelas dunia." }
    ]
  }
};