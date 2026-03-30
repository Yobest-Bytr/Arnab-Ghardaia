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
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم", fr: "Tableau de bord" },
  inventory: { en: "Inventory", ar: "المخزون", fr: "Inventaire" },
  breeding: { en: "Breeding", ar: "التزاوج", fr: "Élevage" },
  reports: { en: "Reports", ar: "التقارير", fr: "Rapports" },
  sales: { en: "Sales", ar: "المبيعات", fr: "Ventes" },
  finance: { en: "Finance", ar: "المالية", fr: "Finance" },
  profile: { en: "Profile", ar: "الملف الشخصي", fr: "Profil" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  about: { en: "About", ar: "حول", fr: "À propos" },
  contact: { en: "Contact", ar: "اتصل بنا", fr: "Contact" },
  
  // Hero & Index
  heroTitle: { en: "Smart Rabbit Farm Management", ar: "إدارة ذكية لمزارع الأرانب", fr: "Gestion Intelligente de Ferme" },
  heroSubtitle: { en: "The ultimate platform for breeders in Ghardaia. Track growth, manage cages, and optimize your sales with neural precision.", ar: "المنصة المثالية للمربين في غرداية. تتبع النمو، أدر الأقفاص، وحسن مبيعاتك بدقة عالية.", fr: "La plateforme ultime pour les éleveurs à Ghardaia. Suivez la croissance et optimisez vos ventes." },
  goDashboard: { en: "Go to Dashboard", ar: "اذهب للوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Rabbits", ar: "عرض الأرانب", fr: "Voir les lapins" },
  happyCustomers: { en: "Happy Customers", ar: "عملاء سعداء", fr: "Clients Heureux" },
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de Santé" },
  healthyRate: { en: "Healthy Rate", ar: "معدل الصحة", fr: "Taux de Santé" },
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب", fr: "Total Lapins" },
  males: { en: "Males", ar: "ذكور", fr: "Mâles" },
  females: { en: "Females", ar: "إناث", fr: "Femelles" },
  newBorns: { en: "Newborns", ar: "مواليد جدد", fr: "Nouveau-nés" },

  // Features
  featuresTitle: { en: "Neural Farm Control", ar: "التحكم العصبي بالمزرعة", fr: "Contrôle Neural de Ferme" },
  featuresSubtitle: { en: "Advanced tools designed for the modern breeder.", ar: "أدوات متطورة مصممة للمربي الحديث.", fr: "Outils avancés pour l'éleveur moderne." },
  feature1Title: { en: "Neural Analytics", ar: "التحليلات العصبية", fr: "Analyses Neurales" },
  feature1Desc: { en: "Get AI-driven insights into your farm's performance and growth.", ar: "احصل على رؤى مدعومة بالذكاء الاصطناعي حول أداء مزرعتك ونموها.", fr: "Obtenez des analyses IA sur les performances de votre ferme." },
  feature2Title: { en: "Inventory Management", ar: "إدارة المخزون", fr: "Gestion de Stock" },
  feature2Desc: { en: "Track every rabbit from birth to sale with detailed lineage and health records.", ar: "تتبع كل أرنب من الولادة إلى البيع مع سجلات مفصلة للنسب والصحة.", fr: "Suivez chaque lapin de la naissance à la vente." },
  feature3Title: { en: "Breeding Cycles", ar: "دورات التزاوج", fr: "Cycles d'Élevage" },
  feature3Desc: { en: "Never miss a litter with automated pregnancy tracking and birth alerts.", ar: "لا تفوت أي ولادة مع تتبع الحمل الآلي وتنبيهات الولادة.", fr: "Ne ratez jamais une portée avec le suivi automatique." },

  // CTA
  ctaTitle: { en: "Ready to scale your farm?", ar: "هل أنت مستعد لتوسيع مزرعتك؟", fr: "Prêt à agrandir votre ferme ?" },
  ctaSubtitle: { en: "Join hundreds of breeders using Arnab Ghardaia to optimize their production.", ar: "انضم إلى مئات المربين الذين يستخدمون أرنب غرداية لتحسين إنتاجهم.", fr: "Rejoignez des centaines d'éleveurs utilisant Arnab Ghardaia." },
  getStartedFree: { en: "Get Started Free", ar: "ابدأ مجاناً", fr: "Commencer Gratuitement" },
  contactSales: { en: "Contact Sales", ar: "اتصل بالمبيعات", fr: "Contacter les Ventes" },

  // Finance & Costs
  totalRevenue: { en: "Total Revenue", ar: "إجمالي الإيرادات", fr: "Revenu Total" },
  totalExpenses: { en: "Total Expenses", ar: "إجمالي المصاريف", fr: "Dépenses Totales" },
  netProfit: { en: "Net Profit", ar: "صافي الربح", fr: "Bénéfice Net" },
  addExpense: { en: "Add Expense", ar: "إضافة مصروف", fr: "Ajouter une dépense" },
  expenseCategory: { en: "Category", ar: "الفئة", fr: "Catégorie" },
  food: { en: "Food/Feed", ar: "العلف/الغذاء", fr: "Nourriture" },
  medicine: { en: "Medicine", ar: "الدواء", fr: "Médecine" },
  equipment: { en: "Equipment", ar: "المعدات", fr: "Équipement" },
  losses: { en: "Losses", ar: "الخسائر", fr: "Pertes" },
  other: { en: "Other", ar: "أخرى", fr: "Autre" },
  amount: { en: "Amount", ar: "المبلغ", fr: "Montant" },
  
  // AI & Neural Lab
  neuralLab: { en: "Neural Lab", ar: "المختبر العصبي", fr: "Labo Neural" },
  aiStrategy: { en: "AI Strategy", ar: "استراتيجية الذكاء", fr: "Stratégie IA" },
  generatePlan: { en: "Generate Project Plan", ar: "إنشاء خطة مشروع", fr: "Générer un plan" },
  visualInsights: { en: "Visual Insights", ar: "رؤى بصرية", fr: "Aperçus visuels" },
  neuralStyle: { en: "Neural Styling", ar: "التنسيق العصبي", fr: "Style Neural" },
  
  // Inventory
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد", fr: "Ajouter un Lapin" },
  rabbitName: { en: "Rabbit Name", ar: "اسم الأرنب", fr: "Nom du Lapin" },
  cageNumber: { en: "Cage #", ar: "رقم القفص", fr: "N° Cage" },
  breed: { en: "Breed", ar: "السلالة", fr: "Race" },
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de santé" },
  age: { en: "Age", ar: "العمر", fr: "Âge" },
  gender: { en: "Gender", ar: "الجنس", fr: "Sexe" },
  male: { en: "Male", ar: "ذكر", fr: "Mâle" },
  female: { en: "Female", ar: "أنثى", fr: "Femelle" },
  healthy: { en: "Healthy", ar: "سليم", fr: "Sain" },
  sick: { en: "Sick", ar: "مريض", fr: "Malade" },
  quarantine: { en: "Quarantine", ar: "حجر صحي", fr: "Quarantaine" },
  months: { en: "Months", ar: "أشهر", fr: "Mois" },
  days: { en: "Days", ar: "أيام", fr: "Jours" },
  searchPlaceholder: { en: "Search by name or ID...", ar: "ابحث بالاسم أو المعرف...", fr: "Rechercher par nom..." },
  
  // Actions
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Enregistrer" },
  delete: { en: "Delete", ar: "حذف", fr: "Supprimer" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  cancel: { en: "Cancel", ar: "إلغاء", fr: "Annuler" },
  recordSale: { en: "Record Sale", ar: "تسجيل بيع", fr: "Enregistrer Vente" },
  recordMating: { en: "Record Mating", ar: "تسجيل تزاوج", fr: "Enregistrer Accouplement" },
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