import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // General & Currency
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  currencyUsd: { en: "USD ($)", ar: "دولار ($)", fr: "USD ($)" },
  currencyDzd: { en: "DZD (DA)", ar: "دج (DA)", fr: "DZD (DA)" },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Enregistrer" },
  
  // Sales Categories
  categoryYoung: { en: "Young (1 Month)", ar: "صغير (شهر)", fr: "Jeune (1 mois)" },
  categoryAdult: { en: "Adult", ar: "بالغ", fr: "Adulte" },
  categoryMeat: { en: "For Meat", ar: "للحم", fr: "Pour viande" },
  salePrice: { en: "Sale Price", ar: "سعر البيع", fr: "Prix de vente" },

  // QR & Search
  scanQr: { en: "Scan QR Code", ar: "مسح رمز QR", fr: "Scanner QR" },
  qrSearch: { en: "Search by QR", ar: "بحث بالرمز", fr: "Recherche par QR" },
  cameraAccess: { en: "Requesting Camera...", ar: "جاري طلب الكاميرا...", fr: "Accès caméra..." },

  // Weight & Age
  weightHistory: { en: "Weight History", ar: "سجل الوزن", fr: "Historique du poids" },
  age: { en: "Age", ar: "العمر", fr: "Âge" },
  months: { en: "Months", ar: "أشهر", fr: "Mois" },
  days: { en: "Days", ar: "أيام", fr: "Jours" },

  // Cages
  cageManagement: { en: "Cage Management", ar: "إدارة الأقفاص", fr: "Gestion des cages" },
  assignCage: { en: "Assign to Cage", ar: "تعيين في قفص", fr: "Assigner à une cage" },
  cageNumber: { en: "Cage #", ar: "رقم القفص", fr: "N° Cage" },

  // Existing keys (truncated for brevity but preserved in code)
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