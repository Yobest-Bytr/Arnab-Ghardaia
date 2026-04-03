import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // General & Navigation
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم", fr: "Tableau de bord" },
  inventory: { en: "Inventory", ar: "المخزون", fr: "Inventaire" },
  breeding: { en: "Breeding", ar: "التزاوج", fr: "Élevage" },
  reports: { en: "Reports", ar: "التقارير", fr: "Rapports" },
  sales: { en: "Sales", ar: "المبيعات", fr: "Ventes" },
  expenses: { en: "Expenses", ar: "المصاريف", fr: "Dépenses" },
  qrStudio: { en: "QR Studio", ar: "استوديو QR", fr: "Studio QR" },
  profile: { en: "Profile", ar: "الملف الشخصي", fr: "Profil" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  logout: { en: "Log Out", ar: "تسجيل الخروج", fr: "Déconnexion" },
  save: { en: "Save", ar: "حفظ", fr: "Enregistrer" },
  cancel: { en: "Cancel", ar: "إلغاء", fr: "Annuler" },
  delete: { en: "Delete", ar: "حذف", fr: "Supprimer" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  view: { en: "View", ar: "عرض", fr: "Voir" },

  // QR Manager
  qrManagerTitle: { en: "QR Printing Studio", ar: "استوديو طباعة QR", fr: "Studio d'Impression QR" },
  qrManagerDesc: { en: "Select rabbits to generate a printable PDF of Neural ID tags.", ar: "اختر الأرانب لإنشاء ملف PDF قابل للطباعة لبطاقات الهوية العصبية.", fr: "Sélectionnez les lapins pour générer un PDF imprimable." },
  generatePdf: { en: "Generate PDF", ar: "إنشاء PDF", fr: "Générer PDF" },
  selectAll: { en: "Select All", ar: "تحديد الكل", fr: "Tout sélectionner" },
  deselectAll: { en: "Deselect All", ar: "إلغاء تحديد الكل", fr: "Tout désélectionner" },

  // Advanced Inventory & Mating
  matingHistory: { en: "Mating History", ar: "سجل التزاوج", fr: "Historique des saillies" },
  weightEvolution: { en: "Weight Evolution", ar: "تطور الوزن", fr: "Évolution du poids" },
  multipleMatings: { en: "Multiple Matings Detected", ar: "تم اكتشاف تزاوجات متعددة", fr: "Saillies multiples détectées" },
  lastMatedWith: { en: "Last Mated With", ar: "آخر تزاوج مع", fr: "Dernière saillie avec" },
  weightKg: { en: "Weight (kg)", ar: "الوزن (كجم)", fr: "Poids (kg)" },
  addWeight: { en: "Log Weight", ar: "تسجيل الوزن", fr: "Enregistrer le poids" },
  matingDate: { en: "Mating Date", ar: "تاريخ التزاوج", fr: "Date de saillie" },
  expectedBirth: { en: "Expected Birth", ar: "الولادة المتوقعة", fr: "Naissance prévue" },
  
  // Statuses
  healthy: { en: "Healthy", ar: "سليم", fr: "Sain" },
  sick: { en: "Sick", ar: "مريض", fr: "Malade" },
  available: { en: "Available", ar: "متاح", fr: "Disponible" },
  sold: { en: "Sold", ar: "تم البيع", fr: "Vendu" },
  pregnant: { en: "Pregnant", ar: "حامل", fr: "Gestante" },

  // Hero Section
  heroTitle: { en: "Smart Rabbit Farm Management", ar: "إدارة ذكية لمزارع الأرانب", fr: "Gestion Intelligente de Ferme" },
  heroSubtitle: { en: "The ultimate platform for breeders in Ghardaia. Track growth, manage cages, and optimize your sales.", ar: "المنصة المثالية للمربين في غرداية. تتبع النمو، أدر الأقفاص، وحسن مبيعاتك.", fr: "La plateforme ultime pour les éleveurs à Ghardaia." },
  
  // Features
  feature1Title: { en: "Real-time Analytics", ar: "تحليلات فورية", fr: "Analyses en Temps Réel" },
  feature1Desc: { en: "Monitor growth rates and health metrics with live data visualization.", ar: "راقب معدلات النمو ومقاييس الصحة مع تصور البيانات الحية.", fr: "Surveillez les taux de croissance et la santé." },
  feature2Title: { en: "Cage Management", ar: "إدارة الأقفاص", fr: "Gestion des Cages" },
  feature2Desc: { en: "Organize your farm layout and track occupancy with a visual map.", ar: "نظم تخطيط مزرعتك وتتبع الإشغال بخريطة مرئية.", fr: "Organisez votre ferme avec une carte visuelle." },
  feature3Title: { en: "Breeding Cycles", ar: "دورات التزاوج", fr: "Cycles d'Élevage" },
  feature3Desc: { en: "Automated reminders for pregnancy checks and weaning dates.", ar: "تذكيرات تلقائية لفحوصات الحمل وتواريخ الفطام.", fr: "Rappels automatiques pour les contrôles." },
  
  // CTA
  ctaTitle: { en: "Ready to modernize your farm?", ar: "هل أنت مستعد لتحديث مزرعتك؟", fr: "Prêt à moderniser votre ferme ?" },
  ctaSubtitle: { en: "Join hundreds of breeders in Ghardaia using Arnab Ghardaia to optimize their production.", ar: "انضم إلى مئات المربين في غرداية الذين يستخدمون أرنب غرداية لتحسين إنتاجهم.", fr: "Rejoignez des centaines d'éleveurs à Ghardaia." },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app_lang') as Language) || 'en');
  const t = (key: string) => translations[key]?.[language] || key;
  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('app_lang', language);
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-cairo' : 'font-inter'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};