import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // General
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم", fr: "Tableau de bord" },
  inventory: { en: "Inventory", ar: "المخزون", fr: "Inventaire" },
  breeding: { en: "Breeding", ar: "التزاوج", fr: "Élevage" },
  reports: { en: "Reports", ar: "التقارير", fr: "Rapports" },
  about: { en: "About Us", ar: "من نحن", fr: "À propos" },
  contact: { en: "Contact", ar: "اتصل بنا", fr: "Contact" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  signup: { en: "Sign Up", ar: "إنشاء حساب", fr: "S'inscrire" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  profile: { en: "Profile", ar: "الملف الشخصي", fr: "Profil" },
  privacyPolicy: { en: "Privacy Policy", ar: "سياسة الخصوصية", fr: "Politique de confidentialité" },
  termsOfService: { en: "Terms of Service", ar: "شروط الخدمة", fr: "Conditions d'utilisation" },
  copyright: { en: "© 2026 Arnab Ghardaia. All rights reserved.", ar: "© 2026 أرنب غرداية. جميع الحقوق محفوظة.", fr: "© 2026 Arnab Ghardaia. Tous droits réservés." },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Enregistrer" },
  searchPlaceholder: { en: "Search by name, ID or breed...", ar: "ابحث بالاسم، الرقم أو السلالة...", fr: "Rechercher par nom, ID ou race..." },
  
  // Hero Section
  heroTitle: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  heroSubtitle: { en: "The premier platform for smart rabbit management in the heart of the M'zab valley. Track, manage, and grow your farm with precision.", ar: "المنصة الرائدة للإدارة الذكية للأرانب في قلب وادي ميزاب. تتبع وإدارة وتنمية مزرعتك بدقة.", fr: "La plateforme de référence pour la gestion intelligente des lapins au cœur de la vallée du M'zab." },
  goDashboard: { en: "Go to Dashboard", ar: "انتقل إلى لوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Our Rabbits", ar: "شاهد أرانبنا", fr: "Voir nos lapins" },
  happyCustomers: { en: "Happy Customers", ar: "عميل سعيد", fr: "Clients Heureux" },
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de Santé" },
  healthyRate: { en: "Healthy", ar: "سليم", fr: "Sain" },

  // About Page
  aboutHero: { en: "Our Story", ar: "قصتنا", fr: "Notre Histoire" },
  aboutDesc: { en: "Arnab Ghardaia was born from a passion for sustainable farming and the unique heritage of the M'zab valley. We combine traditional wisdom with modern technology.", ar: "ولدت أرنب غرداية من شغف بالزراعة المستدامة والتراث الفريد لوادي ميزاب. نحن نجمع بين الحكمة التقليدية والتكنولوجيا الحديثة.", fr: "Arnab Ghardaia est né d'une passion pour l'agriculture durable et l'héritage unique de la vallée du M'zab." },
  qualityCare: { en: "Quality Care", ar: "عناية فائقة", fr: "Soins de Qualité" },
  qualityDesc: { en: "Every rabbit in our farm receives personalized attention, premium organic feed, and regular health check-ups to ensure the highest standards.", ar: "يتلقى كل أرنب في مزرعتنا اهتماماً شخصياً، وعلفاً عضوياً ممتازاً، وفحوصات صحية منتظمة لضمان أعلى المعايير.", fr: "Chaque lapin de notre ferme reçoit une attention personnalisée et une alimentation biologique de qualité." },

  // Features Section
  featuresTitle: { en: "Smart Farm Management", ar: "إدارة المزرعة الذكية", fr: "Gestion de Ferme Intelligente" },
  featuresSubtitle: { en: "Everything you need to run a professional rabbitry in one place.", ar: "كل ما تحتاجه لإدارة مزرعة أرانب احترافية في مكان واحد.", fr: "Tout ce dont vous avez besoin pour gérer une lapinière professionnelle." },
  feature1Title: { en: "Real-time Tracking", ar: "تتبع في الوقت الحقيقي", fr: "Suivi en Temps Réel" },
  feature1Desc: { en: "Monitor health, weight, and growth cycles of every rabbit instantly.", ar: "راقب الصحة والوزن ودورات النمو لكل أرنب على الفور.", fr: "Surveillez instantanément la santé et la croissance de chaque lapin." },
  feature2Title: { en: "Breeding Analytics", ar: "تحليلات التزاوج", fr: "Analyses d'Élevage" },
  feature2Desc: { en: "Predict birth dates and manage litters with automated reminders.", ar: "توقع مواعيد الولادة وإدارة المواليد مع تذكيرات تلقائية.", fr: "Prévoyez les dates de naissance et gérez les portées." },
  feature3Title: { en: "Digital Pedigree", ar: "النسب الرقمي", fr: "Généalogie Numérique" },
  feature3Desc: { en: "Maintain detailed lineage records to ensure genetic diversity.", ar: "احتفظ بسجلات نسب مفصلة لضمان التنوع الجيني.", fr: "Conservez des registres de lignée détaillés." },

  // CTA Section
  ctaTitle: { en: "Ready to grow your farm?", ar: "هل أنت مستعد لتنمية مزرعتك؟", fr: "Prêt à agrandir votre ferme ?" },
  ctaSubtitle: { en: "Join hundreds of breeders in Ghardaia using our platform to optimize their production.", ar: "انضم إلى مئات المربين في غرداية الذين يستخدمون منصتنا لتحسين إنتاجهم.", fr: "Rejoignez des centaines d'éleveurs à Ghardaia utilisant notre plateforme." },
  getStartedFree: { en: "Get Started Free", ar: "ابدأ مجاناً", fr: "Commencer Gratuitement" },
  contactSales: { en: "Contact Sales", ar: "اتصل بالمبيعات", fr: "Contacter les Ventes" },

  // Breeding Autocomplete & Features
  suggestedParents: { en: "Suggested Parents", ar: "الآباء المقترحون", fr: "Parents Suggérés" },
  noMatches: { en: "No matches found", ar: "لم يتم العثور على نتائج", fr: "Aucun résultat" },
  pregnancyProgress: { en: "Pregnancy Progress", ar: "تقدم الحمل", fr: "Progrès de la Grossesse" },
  daysRemaining: { en: "Days Remaining", ar: "أيام متبقية", fr: "Jours Restants" },

  // Command Palette
  quickSearch: { en: "Quick Search", ar: "بحث سريع", fr: "Recherche Rapide" },
  pressToOpen: { en: "Press ⌘K to open", ar: "اضغط ⌘K للفتح", fr: "Appuyez sur ⌘K" },

  // Inventory & CRUD
  rabbitId: { en: "Rabbit ID", ar: "رقم الأرنب", fr: "ID du lapin" },
  cage: { en: "Cage", ar: "القفص", fr: "Cage" },
  weight: { en: "Weight (kg)", ar: "الوزن (كجم)", fr: "Poids (kg)" },
  birthDate: { en: "Birth Date", ar: "تاريخ الميلاد", fr: "Date de naissance" },
  notes: { en: "Notes", ar: "ملاحظات", fr: "Notes" },
  price: { en: "Price", ar: "السعر", fr: "Prix" },
  breed: { en: "Breed", ar: "السلالة", fr: "Race" },
  gender: { en: "Gender", ar: "الجنس", fr: "Sexe" },
  status: { en: "Status", ar: "الحالة", fr: "Statut" },
  male: { en: "Male", ar: "ذكر", fr: "Mâle" },
  female: { en: "Female", ar: "أنثى", fr: "Femelle" },
  available: { en: "Available", ar: "متاح", fr: "Disponible" },
  sold: { en: "Sold", ar: "تم البيع", fr: "Vendu" },
  died: { en: "Died", ar: "نافق", fr: "Mort" },
  healthy: { en: "Healthy", ar: "سليم", fr: "Sain" },
  sick: { en: "Sick", ar: "مريض", fr: "Malade" },
  reserved: { en: "Reserved", ar: "محجوز", fr: "Réservé" },
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد", fr: "Ajouter un Lapin" },
  edit: { en: "Edit Record", ar: "تعديل السجل", fr: "Modifier" },
  
  // Breeding
  activePregnancies: { en: "Active Pregnancies", ar: "حالات الحمل النشطة", fr: "Grossesses Actives" },
  expectedBirth: { en: "Expected Birth", ar: "الولادة المتوقعة", fr: "Naissance Prévue" },
  mother: { en: "Mother", ar: "الأم", fr: "Mère" },
  father: { en: "Father", ar: "الأب", fr: "Père" },
  matingDate: { en: "Mating Date", ar: "تاريخ التزاوج", fr: "Date d'Accouplement" },
  recordMating: { en: "Record Mating", ar: "تسجيل تزاوج", fr: "Enregistrer l'Accouplement" },
  kitCount: { en: "Kit Count", ar: "عدد الصغار", fr: "Nombre de Petits" },

  // Dashboard
  quickActions: { en: "Quick Actions", ar: "إجراءات سريعة", fr: "Actions Rapides" },
  populationGrowth: { en: "Population Growth", ar: "نمو القطيع", fr: "Croissance" },
  recentActivity: { en: "Recent Activity", ar: "النشاط الأخير", fr: "Activité Récente" },
  viewAll: { en: "View All", ar: "عرض الكل", fr: "Voir Tout" },
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب", fr: "Total Lapins" },
  males: { en: "Males", ar: "الذكور", fr: "Mâles" },
  females: { en: "Females", ar: "الإناث", fr: "Femelles" },
  newBorns: { en: "New Borns", ar: "المواليد الجدد", fr: "Nouveau-nés" },
  
  // Reports
  performanceMetrics: { en: "Performance Metrics", ar: "مقاييس الأداء", fr: "Mesures de Performance" },
  downloadPDF: { en: "Download PDF", ar: "تحميل PDF", fr: "Télécharger PDF" },
  statusBreakdown: { en: "Status Breakdown", ar: "تحليل الحالة", fr: "Répartition par Statut" },
  breedDistribution: { en: "Breed Distribution", ar: "توزيع السلالات", fr: "Distribution des Races" },
  transactionLog: { en: "Transaction Log", ar: "سجل المعاملات", fr: "Journal des Transactions" },
  verifiedRecords: { en: "Verified Records", ar: "سجلات موثقة", fr: "Dossiers Vérifiés" },
  reportDate: { en: "Report Date", ar: "تاريخ التقرير", fr: "Date du Rapport" },
  executiveSummary: { en: "Executive Summary", ar: "ملخص تنفيذي", fr: "Résumé Exécutif" },
  totalStock: { en: "Total Stock", ar: "إجمالي المخزون", fr: "Stock Total" },

  // About & Contact
  contactHero: { en: "Get in Touch", ar: "اتصل بنا", fr: "Contactez-nous" },
  contactDesc: { en: "Have questions about our rabbits or services? We're here to help.", ar: "لديك أسئلة حول أرانبنا أو خدماتنا؟ نحن هنا للمساعدة.", fr: "Des questions sur nos lapins ou nos services ? Nous sommes là pour vous aider." },
  fullName: { en: "Full Name", ar: "الاسم الكامل", fr: "Nom complet" },
  emailAddress: { en: "Email Address", ar: "البريد الإلكتروني", fr: "Adresse e-mail" },
  message: { en: "Message", ar: "الرسالة", fr: "Message" },
  sendMessage: { en: "Send Message", ar: "إرسال الرسالة", fr: "Envoyer le message" },
  whatsappChat: { en: "Chat on WhatsApp", ar: "تحدث عبر واتساب", fr: "Discuter sur WhatsApp" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_lang') as Language) || 'en';
  });

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('app_lang', language);
  }, [language, isRTL]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-cairo' : 'font-inter'}>
      <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
        {children}
      </LanguageContext.Provider>
    </div>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};