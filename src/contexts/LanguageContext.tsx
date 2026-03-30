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
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de santé" },
  healthyRate: { en: "Healthy Rate", ar: "معدل الصحة", fr: "Taux de santé" },

  // Features Section
  featuresTitle: { en: "Powerful Features", ar: "مميزات قوية", fr: "Fonctionnalités puissantes" },
  featuresSubtitle: { en: "Everything you need to scale your rabbit production.", ar: "كل ما تحتاجه لتوسيع إنتاج الأرانب الخاص بك.", fr: "Tout ce dont vous avez besoin pour augmenter votre production." },
  feature1Title: { en: "Growth Tracking", ar: "تتبع النمو", fr: "Suivi de croissance" },
  feature1Desc: { en: "Monitor weight gain and health metrics with real-time charts.", ar: "راقب زيادة الوزن ومقاييس الصحة مع رسوم بيانية فورية.", fr: "Surveillez le gain de poids et la santé avec des graphiques." },
  feature2Title: { en: "Cage Management", ar: "إدارة الأقفاص", fr: "Gestion des cages" },
  feature2Desc: { en: "Assign rabbits to cages and scan QR codes for instant access.", ar: "خصص الأرانب للأقفاص وامسح رموز QR للوصول الفوري.", fr: "Assignez les lapins aux cages et scannez les codes QR." },
  feature3Title: { en: "Breeding Cycles", ar: "دورات التزاوج", fr: "Cycles d'élevage" },
  feature3Desc: { en: "Automated pregnancy tracking and birth notifications.", ar: "تتبع تلقائي للحمل وإشعارات الولادة.", fr: "Suivi automatique de la grossesse et notifications." },

  // CTA Section
  ctaTitle: { en: "Ready to optimize your farm?", ar: "جاهز لتحسين مزرعتك؟", fr: "Prêt à optimiser votre ferme ?" },
  ctaSubtitle: { en: "Join hundreds of breeders in Ghardaia using Arnab Ghardaia.", ar: "انضم إلى مئات المربين في غرداية الذين يستخدمون أرنب غرداية.", fr: "Rejoignez des centaines d'éleveurs à Ghardaia." },
  getStartedFree: { en: "Get Started Free", ar: "ابدأ مجاناً", fr: "Commencer gratuitement" },
  contactSales: { en: "Contact Sales", ar: "اتصل بالمبيعات", fr: "Contacter les ventes" },

  // Stats
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب", fr: "Total Lapins" },
  males: { en: "Males", ar: "ذكور", fr: "Mâles" },
  females: { en: "Females", ar: "إناث", fr: "Femelles" },
  newBorns: { en: "Newborns", ar: "مواليد جدد", fr: "Nouveau-nés" },

  // General
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Enregistrer" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
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
  quarantined: { en: "Quarantined", ar: "في الحجر", fr: "En quarantaine" },
  recovering: { en: "Recovering", ar: "يتعافى", fr: "En récupération" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  age: { en: "Age", ar: "العمر", fr: "Âge" },
  months: { en: "Months", ar: "أشهر", fr: "Mois" },
  days: { en: "Days", ar: "أيام", fr: "Jours" },
  cageNumber: { en: "Cage #", ar: "رقم القفص", fr: "N° Cage" },
  searchPlaceholder: { en: "Search by name or ID...", ar: "ابحث بالاسم أو الرقم...", fr: "Rechercher par nom ou ID..." },
  scanQr: { en: "Scan QR Code", ar: "مسح رمز QR", fr: "Scanner QR" },
  cameraAccess: { en: "Requesting Camera...", ar: "جاري طلب الكاميرا...", fr: "Accès caméra..." },
  weightHistory: { en: "Weight History", ar: "سجل الوزن", fr: "Historique du poids" },
  categoryYoung: { en: "Young (1 Month)", ar: "صغير (شهر)", fr: "Jeune (1 mois)" },
  categoryAdult: { en: "Adult", ar: "بالغ", fr: "Adulte" },
  categoryMeat: { en: "For Meat", ar: "للحم", fr: "Pour viande" },
  salePrice: { en: "Sale Price", ar: "سعر البيع", fr: "Prix de vente" },
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