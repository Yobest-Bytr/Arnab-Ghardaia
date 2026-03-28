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
  
  // Hero
  heroTitle: { en: "Smart Rabbit Management", ar: "الإدارة الذكية لمزارع الأرانب", fr: "Gestion Intelligente des Lapins" },
  heroSubtitle: { en: "Track, manage, and grow your rabbit business with real-time statistics and complete inventory control.", ar: "تتبع وإدارة وتنمية أعمال الأرانب الخاصة بك من خلال إحصائيات فورية وتحكم كامل في المخزون.", fr: "Suivez, gérez et développez votre entreprise de lapins avec des statistiques en temps réel." },
  goDashboard: { en: "Go to Dashboard", ar: "انتقل إلى لوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Our Rabbits", ar: "شاهد أرانبنا", fr: "Voir nos lapins" },
  
  // Stats
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب", fr: "Total des lapins" },
  males: { en: "Males", ar: "الذكور", fr: "Mâles" },
  females: { en: "Females", ar: "الإناث", fr: "Femelles" },
  newBorns: { en: "New Borns", ar: "المواليد الجدد", fr: "Nouveau-nés" },
  breeds: { en: "Breeds", ar: "السلالات", fr: "Races" },
  
  // Inventory
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد", fr: "Ajouter un lapin" },
  searchPlaceholder: { en: "Search by name or breed...", ar: "ابحث بالاسم أو السلالة...", fr: "Rechercher par nom ou race..." },
  id: { en: "ID", ar: "المعرف", fr: "ID" },
  name: { en: "Name", ar: "الاسم", fr: "Nom" },
  breed: { en: "Breed", ar: "السلالة", fr: "Race" },
  gender: { en: "Gender", ar: "الجنس", fr: "Genre" },
  age: { en: "Age", ar: "العمر", fr: "Âge" },
  status: { en: "Status", ar: "الحالة", fr: "Statut" },
  health: { en: "Health", ar: "الصحة", fr: "Santé" },
  actions: { en: "Actions", ar: "الإجراءات", fr: "Actions" }
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
      <div dir={isRTL ? 'rtl' : 'ltr'}>
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