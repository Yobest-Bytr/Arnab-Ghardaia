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
  
  // Hero Section
  heroTitle: { en: "Smart Rabbit Management", ar: "الإدارة الذكية لمزارع الأرانب", fr: "Gestion Intelligente des Lapins" },
  heroSubtitle: { en: "Track, manage, and grow your rabbit business with real-time statistics and complete inventory control.", ar: "تتبع وإدارة وتنمية أعمال الأرانب الخاصة بك من خلال إحصائيات فورية وتحكم كامل في المخزون.", fr: "Suivez, gérez et développez votre entreprise de lapins avec des statistiques en temps réel." },
  goDashboard: { en: "Go to Dashboard", ar: "انتقل إلى لوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Our Rabbits", ar: "شاهد أرانبنا", fr: "Voir nos lapins" },
  happyCustomers: { en: "Happy Customers", ar: "عميل سعيد", fr: "Clients Heureux" },
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de Santé" },
  healthyRate: { en: "Healthy", ar: "سليم", fr: "Sain" },

  // Features Section
  featuresTitle: { en: "Why Choose Aranib Farm?", ar: "لماذا تختار مزرعة الأرانب؟", fr: "Pourquoi Choisir Ferme Aranib ?" },
  featuresSubtitle: { en: "We combine traditional farming wisdom with modern technology to ensure the best care for your rabbits.", ar: "نحن نجمع بين حكمة الزراعة التقليدية والتكنولوجيا الحديثة لضمان أفضل رعاية لأرانبك.", fr: "Nous combinons la sagesse agricole traditionnelle avec la technologie moderne." },
  feature1Title: { en: "Real-time Tracking", ar: "تتبع في الوقت الحقيقي", fr: "Suivi en Temps Réel" },
  feature1Desc: { en: "Monitor every rabbit's health, weight, and growth from birth to sale with our intuitive dashboard.", ar: "راقب صحة كل أرنب ووزنه ونموه من الولادة حتى البيع من خلال لوحة التحكم البديهية الخاصة بنا.", fr: "Surveillez la santé, le poids et la croissance de chaque lapin." },
  feature2Title: { en: "Breeding Logic", ar: "منطق التزاوج", fr: "Logique d'Élevage" },
  feature2Desc: { en: "Smart suggestions for breeding pairs to maintain genetic health and maximize farm productivity.", ar: "اقتراحات ذكية لأزواج التزاوج للحفاظ على الصحة الوراثية وزيادة إنتاجية المزرعة.", fr: "Suggestions intelligentes pour les couples reproducteurs." },
  feature3Title: { en: "Financial Insights", ar: "رؤى مالية", fr: "Aperçus Financiers" },
  feature3Desc: { en: "Track sales, expenses, and market trends to understand and grow your farm's profitability.", ar: "تتبع المبيعات والمصروفات واتجاهات السوق لفهم وتنمية ربحية مزرعتك.", fr: "Suivez les ventes, les dépenses et les tendances du marché." },

  // CTA Section
  ctaTitle: { en: "Ready to start your rabbit journey?", ar: "هل أنت مستعد لبدء رحلتك مع الأرانب؟", fr: "Prêt à commencer votre voyage ?" },
  ctaSubtitle: { en: "Join hundreds of successful breeders using Aranib Farm's management system today.", ar: "انضم إلى مئات المربين الناجحين الذين يستخدمون نظام إدارة مزرعة الأرانب اليوم.", fr: "Rejoignez des centaines d'éleveurs utilisant notre système." },
  getStartedFree: { en: "Get Started Free", ar: "ابدأ مجاناً", fr: "Commencer Gratuitement" },
  contactSales: { en: "Contact Sales", ar: "اتصل بالمبيعات", fr: "Contacter les Ventes" },

  // Rabbit Details & Inventory
  rabbitId: { en: "Rabbit ID", ar: "رقم الأرنب", fr: "ID du lapin" },
  qrCode: { en: "QR Code", ar: "رمز QR", fr: "Code QR" },
  weight: { en: "Weight (kg)", ar: "الوزن (كجم)", fr: "Poids (kg)" },
  birthDate: { en: "Birth Date", ar: "تاريخ الميلاد", fr: "Date de naissance" },
  notes: { en: "Notes", ar: "ملاحظات", fr: "Notes" },
  cage: { en: "Cage", ar: "القفص", fr: "Cage" },
  price: { en: "Price", ar: "السعر", fr: "Prix" },
  breed: { en: "Breed", ar: "السلالة", fr: "Race" },
  gender: { en: "Gender", ar: "الجنس", fr: "Sexe" },
  status: { en: "Status", ar: "الحالة", fr: "Statut" },
  
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
  
  // Actions
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد", fr: "Ajouter un lapin" },
  addRecord: { en: "Add Record", ar: "إضافة سجل", fr: "Ajouter un enregistrement" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  delete: { en: "Delete", ar: "حذف", fr: "Supprimer" },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Sauvegarder" },
  export: { en: "Export Data", ar: "تصدير البيانات", fr: "Exporter" },
  viewDetails: { en: "View Details", ar: "عرض التفاصيل", fr: "Voir les détails" },
  searchPlaceholder: { en: "Search by ID, name or breed...", ar: "ابحث بالرقم، الاسم أو السلالة...", fr: "Rechercher par ID, nom ou race..." },
  
  // Dashboard Specific
  recentActivity: { en: "Recent Activity", ar: "النشاط الأخير", fr: "Activité récente" },
  populationGrowth: { en: "Population Growth", ar: "نمو القطيع", fr: "Croissance" },
  farmHealth: { en: "Farm Health", ar: "صحة المزرعة", fr: "Santé de la ferme" },
  viewAll: { en: "View All", ar: "عرض الكل", fr: "Voir tout" },
  quickActions: { en: "Quick Actions", ar: "إجراءات سريعة", fr: "Actions rapides" },
  recordMating: { en: "Record Mating", ar: "تسجيل تزاوج", fr: "Enregistrer l'accouplement" }
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