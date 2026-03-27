import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // General
  appName: { en: "Aranib Farm", ar: "مزرعة الأرانب" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  inventory: { en: "Inventory", ar: "المخزون" },
  breeding: { en: "Breeding", ar: "التزاوج" },
  reports: { en: "Reports", ar: "التقارير" },
  about: { en: "About Us", ar: "من نحن" },
  contact: { en: "Contact", ar: "اتصل بنا" },
  login: { en: "Login", ar: "تسجيل الدخول" },
  signup: { en: "Sign Up", ar: "إنشاء حساب" },
  
  // Hero
  heroTitle: { en: "Smart Rabbit Management", ar: "الإدارة الذكية لمزارع الأرانب" },
  heroSubtitle: { en: "Track, manage, and grow your rabbit business with real-time statistics and complete inventory control.", ar: "تتبع وإدارة وتنمية أعمال الأرانب الخاصة بك من خلال إحصائيات فورية وتحكم كامل في المخزون." },
  goDashboard: { en: "Go to Dashboard", ar: "انتقل إلى لوحة التحكم" },
  viewRabbits: { en: "View Our Rabbits", ar: "شاهد أرانبنا" },
  
  // Stats
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب" },
  males: { en: "Males", ar: "الذكور" },
  females: { en: "Females", ar: "الإناث" },
  newBorns: { en: "New Borns", ar: "المواليد الجدد" },
  breeds: { en: "Breeds", ar: "السلالات" },
  
  // Inventory
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد" },
  searchPlaceholder: { en: "Search by name or breed...", ar: "ابحث بالاسم أو السلالة..." },
  id: { en: "ID", ar: "المعرف" },
  name: { en: "Name", ar: "الاسم" },
  breed: { en: "Breed", ar: "السلالة" },
  gender: { en: "Gender", ar: "الجنس" },
  age: { en: "Age", ar: "العمر" },
  status: { en: "Status", ar: "الحالة" },
  health: { en: "Health", ar: "الصحة" },
  actions: { en: "Actions", ar: "الإجراءات" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
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