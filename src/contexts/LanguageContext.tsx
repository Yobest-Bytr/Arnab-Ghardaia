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
  
  // About & Contact
  contactHero: { en: "Get in Touch", ar: "اتصل بنا", fr: "Contactez-nous" },
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