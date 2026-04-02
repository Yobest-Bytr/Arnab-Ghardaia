import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Hero & General
  heroTitle: { en: "Smart Rabbit Farm Management", ar: "إدارة ذكية لمزارع الأرانب", fr: "Gestion Intelligente de Ferme de Lapins" },
  heroSubtitle: { en: "The ultimate platform for breeders in Ghardaia. Track growth, manage cages, and optimize your sales with neural precision.", ar: "المنصة المثالية للمربين في غرداية. تتبع النمو، أدر الأقفاص، وحسن مبيعاتك بدقة عالية.", fr: "La plateforme ultime pour les éleveurs à Ghardaia. Suivez la croissance, gérez les cages et optimisez vos ventes." },
  goDashboard: { en: "Go to Dashboard", ar: "اذهب للوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Rabbits", ar: "عرض الأرانب", fr: "Voir les lapins" },
  happyCustomers: { en: "Happy Breeders", ar: "مربي سعيد", fr: "Éleveurs satisfaits" },
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de santé" },
  healthyRate: { en: "Healthy Rate", ar: "معدل الصحة", fr: "Taux de santé" },
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Enregistrer" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم", fr: "Tableau de bord" },
  inventory: { en: "Inventory", ar: "المخزون", fr: "Inventaire" },
  breeding: { en: "Breeding", ar: "التزاوج", fr: "Élevage" },
  reports: { en: "Reports", ar: "التقارير", fr: "Rapports" },
  sales: { en: "Sales", ar: "المبيعات", fr: "Ventes" },
  expenses: { en: "Expenses", ar: "المصاريف", fr: "Dépenses" },
  about: { en: "About", ar: "حول", fr: "À propos" },
  contact: { en: "Contact", ar: "اتصل بنا", fr: "Contact" },
  
  // Inventory Page
  addRabbit: { en: "Add New Rabbit", ar: "إضافة أرنب جديد", fr: "Ajouter un Lapin" },
  rabbitName: { en: "Rabbit Name", ar: "اسم الأرنب", fr: "Nom du lapin" },
  breedSelection: { en: "Breed Selection", ar: "اختيار السلالة", fr: "Sélection de race" },
  genderSelection: { en: "Gender Selection", ar: "اختيار الجنس", fr: "Sélection du sexe" },
  birthDate: { en: "Birth Date", ar: "تاريخ الميلاد", fr: "Date de naissance" },
  weightKg: { en: "Weight (kg)", ar: "الوزن (كجم)", fr: "Poids (kg)" },
  cageNumber: { en: "Cage #", ar: "رقم القفص", fr: "N° Cage" },
  cageType: { en: "Cage Type", ar: "نوع القفص", fr: "Type de cage" },
  status: { en: "Status", ar: "الحالة", fr: "Statut" },
  available: { en: "Available", ar: "متاح", fr: "Disponible" },
  sold: { en: "Sold", ar: "تم البيع", fr: "Vendu" },
  died: { en: "Died", ar: "نافق", fr: "Mort" },
  healthy: { en: "Healthy", ar: "سليم", fr: "Sain" },
  sick: { en: "Sick", ar: "مريض", fr: "Malade" },
  recovering: { en: "Recovering", ar: "يتعافى", fr: "En récupération" },
  motherId: { en: "Mother ID", ar: "رقم الأم", fr: "ID Mère" },
  fatherId: { en: "Father ID", ar: "رقم الأب", fr: "ID Père" },
  matingPartner: { en: "Mating Partner", ar: "شريك التزاوج", fr: "Partenaire" },
  vaccination: { en: "Vaccination", ar: "التطعيم", fr: "Vaccination" },
  medicalNotes: { en: "Medical Notes", ar: "ملاحظات طبية", fr: "Notes médicales" },
  publishToShop: { en: "Publish to Boutique", ar: "نشر في المتجر", fr: "Publier en Boutique" },
  publishDesc: { en: "Make this rabbit visible to public buyers.", ar: "اجعل هذا الأرنب مرئياً للمشترين.", fr: "Rendre visible aux acheteurs." },
  
  // Breeding Page
  recordMating: { en: "Record Mating", ar: "تسجيل تزاوج", fr: "Enregistrer saillie" },
  activePregnancies: { en: "Active Pregnancies", ar: "حالات حمل نشطة", fr: "Grossesses actives" },
  expectedBirth: { en: "Expected Birth", ar: "الولادة المتوقعة", fr: "Naissance prévue" },
  actualBirthDate: { en: "Actual Birth Date", ar: "تاريخ الولادة الفعلي", fr: "Date de naissance réelle" },
  daysRemaining: { en: "Days Remaining", ar: "أيام متبقية", fr: "Jours restants" },
  mother: { en: "Mother", ar: "الأم", fr: "Mère" },
  father: { en: "Father", ar: "الأب", fr: "Père" },
  matingDate: { en: "Mating Date", ar: "تاريخ التزاوج", fr: "Date de saillie" },
  totalKits: { en: "Total Kits", ar: "إجمالي المواليد", fr: "Total lapereaux" },
  kitsAlive: { en: "Kits Alive", ar: "مواليد أحياء", fr: "Lapereaux vivants" },
  kitsDead: { en: "Kits Dead", ar: "مواليد نافقة", fr: "Lapereaux morts" },
  splitLitter: { en: "Split Litter", ar: "فصل البطن", fr: "Séparer la portée" },
  
  // Sales & Expenses
  recordSale: { en: "Record Sale", ar: "تسجيل عملية بيع", fr: "Enregistrer une vente" },
  customerName: { en: "Customer Name", ar: "اسم المشتري", fr: "Nom du client" },
  salePrice: { en: "Sale Price", ar: "سعر البيع", fr: "Prix de vente" },
  saleDate: { en: "Sale Date", ar: "تاريخ البيع", fr: "Date de vente" },
  totalSales: { en: "Total Sales", ar: "إجمالي المبيعات", fr: "Ventes totales" },
  expenseCategory: { en: "Category", ar: "الفئة", fr: "Catégorie" },
  amount: { en: "Amount", ar: "المبلغ", fr: "Montant" },
  addRecord: { en: "Add Record", ar: "إضافة سجل", fr: "Ajouter un record" },
  
  // Tasks & Schedule
  initializeTask: { en: "Initialize Task", ar: "بدء مهمة", fr: "Initialiser tâche" },
  efficiencyRating: { en: "Efficiency Rating", ar: "معدل الكفاءة", fr: "Taux d'efficacité" },
  pendingNodes: { en: "Pending Nodes", ar: "مهام معلقة", fr: "Tâches en attente" },
  criticalAlerts: { en: "Critical Alerts", ar: "تنبيهات حرجة", fr: "Alertes critiques" },
  taskOptimized: { en: "Task Optimized", ar: "تم إنجاز المهمة", fr: "Tâche optimisée" },
  taskRestored: { en: "Task Restored", ar: "تم استعادة المهمة", fr: "Tâche restaurée" },
  
  // Profile & Settings
  neuralSettings: { en: "Neural Settings", ar: "الإعدادات العصبية", fr: "Paramètres Neuraux" },
  identity: { en: "Identity", ar: "الهوية", fr: "Identité" },
  neuralKeys: { en: "Neural Keys", ar: "المفاتيح العصبية", fr: "Clés Neurales" },
  security: { en: "Security", ar: "الأمان", fr: "Sécurité" },
  displayName: { en: "Display Name", ar: "اسم العرض", fr: "Nom d'affichage" },
  emailAddress: { en: "Email Address", ar: "البريد الإلكتروني", fr: "Adresse e-mail" },
  saveIdentity: { en: "Save Identity", ar: "حفظ الهوية", fr: "Enregistrer l'identité" },
  initializeUplink: { en: "Initialize Neural Uplink", ar: "بدء الربط العصبي", fr: "Initialiser le lien" },
  terminateSession: { en: "Terminate Session", ar: "إنهاء الجلسة", fr: "Terminer la session" },
  
  // Reports
  neuralAudit: { en: "Neural Audit", ar: "التدقيق العصبي", fr: "Audit Neural" },
  downloadPDF: { en: "Download PDF", ar: "تحميل PDF", fr: "Télécharger PDF" },
  mortalityRate: { en: "Mortality Rate", ar: "معدل النفوق", fr: "Taux de mortalité" },
  breedingSuccess: { en: "Breeding Success", ar: "نجاح التزاوج", fr: "Succès d'élevage" },
  salesVsExpenses: { en: "Sales vs Expenses", ar: "المبيعات مقابل المصاريف", fr: "Ventes vs Dépenses" },
  productionSummary: { en: "Production Summary", ar: "ملخص الإنتاج", fr: "Résumé de production" },
  
  // Neural Lab
  neuralLab: { en: "Neural Lab", ar: "المختبر العصبي", fr: "Labo Neural" },
  engineOnline: { en: "Engine Online", ar: "المحرك متصل", fr: "Moteur en ligne" },
  nodesLinked: { en: "Nodes Linked", ar: "عقد متصلة", fr: "Nœuds liés" },
  secureUplink: { en: "Secure Uplink", ar: "رابط آمن", fr: "Lien sécurisé" },
  ghardaiaNode: { en: "Ghardaia Node", ar: "عقدة غرداية", fr: "Nœud Ghardaia" },
  askAiPlaceholder: { en: "Ask Yobest AI to analyze, add, or edit...", ar: "اسأل ذكاء Yobest للتحليل أو الإضافة أو التعديل...", fr: "Demandez à l'IA d'analyser, ajouter ou modifier..." },
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