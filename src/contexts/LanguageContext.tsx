import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Hero Section
  heroTitle: { 
    en: "Smart Rabbit Farm Management", 
    ar: "إدارة ذكية لمزارع الأرانب", 
    fr: "Gestion Intelligente de Ferme de Lapins" 
  },
  heroSubtitle: { 
    en: "The ultimate platform for breeders in Ghardaia. Track growth, manage cages, and optimize your sales with neural precision.", 
    ar: "المنصة المثالية للمربين في غرداية. تتبع النمو، أدر الأقفاص، وحسن مبيعاتك بدقة عالية.", 
    fr: "La plateforme ultime pour les éleveurs à Ghardaia. Suivez la croissance, gérez les cages et optimisez vos ventes." 
  },
  goDashboard: { en: "Go to Dashboard", ar: "اذهب للوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Rabbits", ar: "عرض الأرانب", fr: "Voir les lapins" },
  happyCustomers: { en: "Happy Breeders", ar: "مربي سعيد", fr: "Éleveurs satisfaits" },

  // General & Currency
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  currencyUsd: { en: "USD ($)", ar: "دولار ($)", fr: "USD ($)" },
  currencyDzd: { en: "DZD (DA)", ar: "دج (DA)", fr: "DZD (DA)" },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Enregistrer" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  profile: { en: "Profile", ar: "الملف الشخصي", fr: "Profil" },
  
  // Sales Categories
  categoryYoung: { en: "Young (1 Month)", ar: "صغير (شهر)", fr: "Jeune (1 mois)" },
  categoryAdult: { en: "Adult", ar: "بالغ", fr: "Adulte" },
  categoryMeat: { en: "For Meat", ar: "للحم", fr: "Pour viande" },
  salePrice: { en: "Sale Price", ar: "سعر البيع", fr: "Prix de vente" },

  // QR & Search
  scanQr: { en: "Scan QR Code", ar: "مسح رمز QR", fr: "Scanner QR" },
  qrSearch: { en: "Search by QR", ar: "بحث بالرمز", fr: "Recherche par QR" },
  cameraAccess: { en: "Requesting Camera...", ar: "جاري طلب الكاميرا...", fr: "Accès caméra..." },
  searchPlaceholder: { en: "Search by name or ID...", ar: "ابحث بالاسم أو الرقم...", fr: "Rechercher par nom ou ID..." },

  // Weight & Age
  weightHistory: { en: "Weight History", ar: "سجل الوزن", fr: "Historique du poids" },
  age: { en: "Age", ar: "العمر", fr: "Âge" },
  months: { en: "Months", ar: "أشهر", fr: "Mois" },
  days: { en: "Days", ar: "أيام", fr: "Jours" },

  // Cages
  cageManagement: { en: "Cage Management", ar: "إدارة الأقفاص", fr: "Gestion des cages" },
  assignCage: { en: "Assign to Cage", ar: "تعيين في قفص", fr: "Assigner à une cage" },
  cageNumber: { en: "Cage #", ar: "رقم القفص", fr: "N° Cage" },

  // Dashboard & Inventory
  dashboard: { en: "Dashboard", ar: "لوحة التحكم", fr: "Tableau de bord" },
  inventory: { en: "Inventory", ar: "المخزون", fr: "Inventaire" },
  breeding: { en: "Breeding", ar: "التزاوج", fr: "Élevage" },
  reports: { en: "Reports", ar: "التقارير", fr: "Rapports" },
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد", fr: "Ajouter un Lapin" },
  status: { en: "Status", ar: "الحالة", fr: "Statut" },
  available: { en: "Available", ar: "متاح", fr: "Disponible" },
  sold: { en: "Sold", ar: "تم البيع", fr: "Vendu" },
  died: { en: "Died", ar: "نافق", fr: "Mort" },
  healthy: { en: "Healthy", ar: "سليم", fr: "Sain" },
  sick: { en: "Sick", ar: "مريض", fr: "Malade" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  performanceMetrics: { en: "Performance Metrics", ar: "مقاييس الأداء", fr: "Mesures de performance" },
  downloadPDF: { en: "Download PDF", ar: "تحميل PDF", fr: "Télécharger PDF" },
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