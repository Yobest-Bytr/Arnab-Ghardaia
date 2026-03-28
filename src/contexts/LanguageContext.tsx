import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // General
  appName: { en: "Aranib Farm", ar: "مزرعة الأرانب", fr: "Ferme Aranib" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم", fr: "Tableau de bord" },
  inventory: { en: "Inventory", ar: "المخزون", fr: "Inventaire" },
  breeding: { en: "Breeding", ar: "التزاوج", fr: "Élevage" },
  reports: { en: "Reports", ar: "التقارير", fr: "Rapports" },
  about: { en: "About Us", ar: "من نحن", fr: "À propos" },
  contact: { en: "Contact", ar: "اتصل بنا", fr: "Contact" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  signup: { en: "Sign Up", ar: "إنشاء حساب", fr: "S'inscrire" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  changelog: { en: "Changelog", ar: "سجل التغييرات", fr: "Journal" },
  profile: { en: "Profile", ar: "الملف الشخصي", fr: "Profil" },
  
  // Hero
  heroTitle: { en: "Smart Rabbit Management", ar: "الإدارة الذكية لمزارع الأرانب", fr: "Gestion Intelligente des Lapins" },
  heroSubtitle: { en: "Track, manage, and grow your rabbit business with real-time statistics and complete inventory control.", ar: "تتبع وإدارة وتنمية أعمال الأرانب الخاصة بك من خلال إحصائيات فورية وتحكم كامل في المخزون.", fr: "Suivez, gérez et développez votre entreprise de lapins avec des statistiques en temps réel." },
  goDashboard: { en: "Go to Dashboard", ar: "انتقل إلى لوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Our Rabbits", ar: "شاهد أرانبنا", fr: "Voir nos lapins" },
  
  // Stats & Status
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب", fr: "Total des lapins" },
  males: { en: "Males", ar: "الذكور", fr: "Mâles" },
  females: { en: "Females", ar: "الإناث", fr: "Femelles" },
  newBorns: { en: "New Borns", ar: "المواليد الجدد", fr: "Nouveau-nés" },
  available: { en: "Available", ar: "متاح", fr: "Disponible" },
  sold: { en: "Sold", ar: "تم البيع", fr: "Vendu" },
  died: { en: "Died", ar: "نافق", fr: "Mort" },
  healthy: { en: "Healthy", ar: "سليم", fr: "Sain" },
  sick: { en: "Sick", ar: "مريض", fr: "Malade" },
  reserved: { en: "Reserved", ar: "محجوز", fr: "Réservé" },
  
  // Breeding Specific
  matingDate: { en: "Mating Date", ar: "تاريخ التزاوج", fr: "Date d'accouplement" },
  expectedBirth: { en: "Expected Birth", ar: "الولادة المتوقعة", fr: "Naissance prévue" },
  mother: { en: "Mother", ar: "الأم", fr: "Mère" },
  father: { en: "Father", ar: "الأب", fr: "Père" },
  kitCount: { en: "Kit Count", ar: "عدد الصغار", fr: "Nombre de petits" },
  recordMating: { en: "Record Mating", ar: "تسجيل تزاوج", fr: "Enregistrer l'accouplement" },
  activePregnancies: { en: "Active Pregnancies", ar: "حالات الحمل النشطة", fr: "Grossesses actives" },
  
  // Inventory Specific
  cage: { en: "Cage", ar: "القفص", fr: "Cage" },
  price: { en: "Price", ar: "السعر", fr: "Prix" },
  breed: { en: "Breed", ar: "السلالة", fr: "Race" },
  gender: { en: "Gender", ar: "الجنس", fr: "Sexe" },
  addRecord: { en: "Add Record", ar: "إضافة سجل", fr: "Ajouter un enregistrement" },
  quickFilter: { en: "Quick Filter", ar: "تصفية سريعة", fr: "Filtre rapide" },
  
  // Actions
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد", fr: "Ajouter un lapin" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  delete: { en: "Delete", ar: "حذف", fr: "Supprimer" },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Sauvegarder" },
  export: { en: "Export Data", ar: "تصدير البيانات", fr: "Exporter" },
  searchPlaceholder: { en: "Search by name or breed...", ar: "ابحث بالاسم أو السلالة...", fr: "Rechercher par nom ou race..." },
  
  // Dashboard Specific
  recentActivity: { en: "Recent Activity", ar: "النشاط الأخير", fr: "Activité récente" },
  populationGrowth: { en: "Population Growth", ar: "نمو القطيع", fr: "Croissance" },
  farmHealth: { en: "Farm Health", ar: "صحة المزرعة", fr: "Santé de la ferme" },
  viewAll: { en: "View All", ar: "عرض الكل", fr: "Voir tout" },
  quickActions: { en: "Quick Actions", ar: "إجراءات سريعة", fr: "Actions rapides" }
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