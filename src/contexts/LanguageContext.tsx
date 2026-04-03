"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // General & Navigation
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم", fr: "Tableau de bord" },
  inventory: { en: "Inventory", ar: "المخزون", fr: "Inventaire" },
  breeding: { en: "Breeding", ar: "التزاوج", fr: "Élevage" },
  reports: { en: "Reports", ar: "التقارير", fr: "Rapports" },
  sales: { en: "Sales", ar: "المبيعات", fr: "Ventes" },
  expenses: { en: "Expenses", ar: "المصاريف", fr: "Dépenses" },
  qrStudio: { en: "QR Studio", ar: "استوديو QR", fr: "Studio QR" },
  profile: { en: "Profile", ar: "الملف الشخصي", fr: "Profil" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  logout: { en: "Log Out", ar: "تسجيل الخروج", fr: "Déconnexion" },
  save: { en: "Save", ar: "حفظ", fr: "Enregistrer" },
  cancel: { en: "Cancel", ar: "إلغاء", fr: "Annuler" },
  delete: { en: "Delete", ar: "حذف", fr: "Supprimer" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  view: { en: "View", ar: "عرض", fr: "Voir" },
  contact: { en: "Contact", ar: "اتصل بنا", fr: "Contact" },
  about: { en: "About", ar: "حول", fr: "À propos" },
  security: { en: "Security", ar: "الأمان", fr: "Sécurité" },
  privacyPolicy: { en: "Privacy Policy", ar: "سياسة الخصوصية", fr: "Politique de confidentialité" },
  termsOfService: { en: "Terms of Service", ar: "شروط الخدمة", fr: "Conditions d'utilisation" },
  copyright: { en: "© 2026 Arnab Ghardaia. All rights reserved.", ar: "© 2026 أرنب غرداية. جميع الحقوق محفوظة.", fr: "© 2026 Arnab Ghardaia. Tous droits réservés." },
  unknown: { en: "Unknown", ar: "غير معروف", fr: "Inconnu" },
  notAvailable: { en: "N/A", ar: "غير متوفر", fr: "N/A" },

  // Inventory Page & Modals
  neuralInventoryActive: { en: "Neural Inventory Active", ar: "المخزون العصبي نشط", fr: "Inventaire Neural Actif" },
  theStockpile: { en: "The Stockpile.", ar: "المخزون.", fr: "Le Stock." },
  searchNeuralId: { en: "Search Neural ID...", ar: "البحث عن المعرف العصبي...", fr: "Rechercher ID Neural..." },
  addRabbit: { en: "Add Rabbit", ar: "إضافة أرنب", fr: "Ajouter un lapin" },
  rabbitName: { en: "Rabbit Name", ar: "اسم الأرنب", fr: "Nom du lapin" },
  breedSelection: { en: "Breed Selection", ar: "اختيار السلالة", fr: "Sélection de la race" },
  genderSelection: { en: "Gender Selection", ar: "اختيار الجنس", fr: "Sélection du sexe" },
  weightKg: { en: "Weight (kg)", ar: "الوزن (كجم)", fr: "Poids (kg)" },
  birthDate: { en: "Birth Date", ar: "تاريخ الميلاد", fr: "Date de naissance" },
  salePrice: { en: "Sale Price", ar: "سعر البيع", fr: "Prix de vente" },
  status: { en: "Status", ar: "الحالة", fr: "Statut" },
  cageNumber: { en: "Cage Number", ar: "رقم القفص", fr: "Numéro de cage" },
  cageType: { en: "Cage Type", ar: "نوع القفص", fr: "Type de cage" },
  matingPartner: { en: "Mating Partner", ar: "شريك التزاوج", fr: "Partenaire de saillie" },
  motherId: { en: "Mother ID", ar: "رقم الأم", fr: "ID de la mère" },
  fatherId: { en: "Father ID", ar: "رقم الأب", fr: "ID du père" },
  vaccination: { en: "Vaccination", ar: "التلقيح", fr: "Vaccination" },
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de santé" },
  medicalNotes: { en: "Medical Notes", ar: "ملاحظات طبية", fr: "Notes médicales" },
  publishToShop: { en: "Publish to Boutique", ar: "نشر في المتجر", fr: "Publier en boutique" },
  publishDesc: { en: "Make this rabbit visible to public buyers.", ar: "اجعل هذا الأرنب مرئيًا للمشترين العامين.", fr: "Rendre ce lapin visible aux acheteurs." },
  basicInfo: { en: "Basic Info", ar: "معلومات أساسية", fr: "Infos de base" },
  medical: { en: "Medical", ar: "طبي", fr: "Médical" },
  lineage: { en: "Lineage", ar: "النسب", fr: "Lignage" },
  history: { en: "History", ar: "السجل", fr: "Historique" },
  age: { en: "Age", ar: "العمر", fr: "Âge" },
  months: { en: "Months", ar: "أشهر", fr: "Mois" },
  days: { en: "Days", ar: "أيام", fr: "Jours" },
  multipleMatings: { en: "Multiple Matings Detected", ar: "تم اكتشاف تزاوجات متعددة", fr: "Saillies multiples détectées" },
  helpSelectRabbit: { en: "Search by name or ID", ar: "ابحث بالاسم أو الرقم", fr: "Chercher par nom ou ID" },
  helpMatingDate: { en: "Date of mating session", ar: "تاريخ جلسة التزاوج", fr: "Date de la saillie" },
  updateWeight: { en: "Update Weight", ar: "تحديث الوزن", fr: "Mettre à jour le poids" },
  mating: { en: "Mating", ar: "تزاوج", fr: "Saillie" },
  printNeuralTag: { en: "Print Neural Tag", ar: "طباعة بطاقة عصبية", fr: "Imprimer étiquette neurale" },
  neuralIdTag: { en: "Neural ID Tag", ar: "بطاقة الهوية العصبية", fr: "Étiquette ID Neurale" },
  weightVelocity: { en: "Weight Velocity", ar: "سرعة الوزن", fr: "Vélocité du poids" },
  vaccinationStatus: { en: "Vaccination Status", ar: "حالة التلقيح", fr: "Statut de vaccination" },
  motherDam: { en: "Mother (Dam)", ar: "الأم", fr: "Mère (Lice)" },
  fatherSire: { en: "Father (Sire)", ar: "الأب", fr: "Père (Étalon)" },
  newWeight: { en: "New Weight (kg)", ar: "الوزن الجديد (كجم)", fr: "Nouveau poids (kg)" },
  confirmSplit: { en: "Confirm Split", ar: "تأكيد الفصل", fr: "Confirmer la séparation" },
  malesToCreate: { en: "Males to Create", ar: "عدد الذكور", fr: "Mâles à créer" },
  femalesToCreate: { en: "Females to Create", ar: "عدد الإناث", fr: "Femelles à créer" },
  neuralId: { en: "Neural ID", ar: "المعرف العصبي", fr: "ID Neural" },
  colorMarkings: { en: "Color / Markings", ar: "اللون / العلامات", fr: "Couleur / Marquages" },
  sourceOrigin: { en: "Source / Origin", ar: "المصدر / الأصل", fr: "Source / Origine" },

  // Breeding & Litters
  recordMating: { en: "Record Mating", ar: "تسجيل تزاوج", fr: "Enregistrer saillie" },
  mother: { en: "Mother", ar: "الأم", fr: "Mère" },
  father: { en: "Father", ar: "الأب", fr: "Père" },
  matingDate: { en: "Mating Date", ar: "تاريخ التزاوج", fr: "Date de saillie" },
  actualBirthDate: { en: "Actual Birth Date", ar: "تاريخ الولادة الفعلي", fr: "Date de naissance réelle" },
  totalKits: { en: "Total Kits", ar: "إجمالي المواليد", fr: "Total lapereaux" },
  kitsBorn: { en: "Kits Born", ar: "المواليد", fr: "Lapereaux nés" },
  kitsAlive: { en: "Kits Alive", ar: "الأحياء", fr: "Lapereaux vivants" },
  kitsDead: { en: "Kits Dead", ar: "الموتى", fr: "Lapereaux morts" },
  splitLitter: { en: "Split Litter", ar: "فصل البطن", fr: "Séparer la portée" },
  expectedBirth: { en: "Expected Birth", ar: "الولادة المتوقعة", fr: "Naissance prévue" },
  litters: { en: "Litters", ar: "البطون", fr: "Portées" },
  matingHistory: { en: "Mating History", ar: "سجل التزاوج", fr: "Historique des saillies" },
  activePregnancies: { en: "Active Pregnancies", ar: "حالات حمل نشطة", fr: "Gestation en cours" },
  recentActivity: { en: "Recent Activity", ar: "النشاط الأخير", fr: "Activité récente" },
  successRate: { en: "Success Rate", ar: "نسبة النجاح", fr: "Taux de réussite" },
  daysRemaining: { en: "Days Remaining", ar: "أيام متبقية", fr: "Jours restants" },
  litterSuffix: { en: "'s Litter", ar: "بطن", fr: "Portée de" },

  // QR Manager & Scanner
  qrManagerTitle: { en: "QR Printing Studio", ar: "استوديو طباعة QR", fr: "Studio d'Impression QR" },
  qrManagerDesc: { en: "Select rabbits to generate a printable PDF of Neural ID tags.", ar: "اختر الأرانب لإنشاء ملف PDF قابل للطباعة لبطاقات الهوية العصبية.", fr: "Sélectionnez les lapins pour générer un PDF imprimable." },
  generatePdf: { en: "Generate PDF", ar: "إنشاء PDF", fr: "Générer PDF" },
  selectAll: { en: "Select All", ar: "تحديد الكل", fr: "Tout sélectionner" },
  neuralScan: { en: "Neural Scan.", ar: "المسح العصبي.", fr: "Scan Neural." },
  alignNeuralTag: { en: "Align Neural ID Tag to Initialize", ar: "قم بمحاذاة بطاقة الهوية العصبية للبدء", fr: "Alignez l'étiquette ID Neurale pour initialiser" },

  // Messages & Toasts
  operationFailed: { en: "Operation failed.", ar: "فشلت العملية.", fr: "L'opération a échoué." },
  weightUpdated: { en: "Weight updated.", ar: "تم تحديث الوزن.", fr: "Poids mis à jour." },
  updateFailed: { en: "Update failed.", ar: "فشل التحديث.", fr: "Échec de la mise à jour." },
  splitFailed: { en: "Split failed.", ar: "فشل الفصل.", fr: "Échec de la séparation." },
  rabbitRemoved: { en: "Rabbit removed.", ar: "تمت إزالة الأرنب.", fr: "Lapin supprimé." },
  splitExceedsKits: { en: "Total split exceeds alive kits.", ar: "إجمالي الفصل يتجاوز المواليد الأحياء.", fr: "Le total dépasse les lapereaux vivants." },
  neuralIdFound: { en: "Neural ID Found: ", ar: "تم العثور على المعرف العصبي: ", fr: "ID Neural trouvé: " },
  neuralIdNotFound: { en: "Neural ID not recognized in local database.", ar: "المعرف العصبي غير معترف به في قاعدة البيانات المحلية.", fr: "ID Neural non reconnu dans la base de données locale." },
  sonOf: { en: "Son of", ar: "ابن", fr: "Fils de" },
  daughterOf: { en: "Daughter of", ar: "ابنة", fr: "Fille de" },

  // Sales & Expenses
  recordSale: { en: "Record Sale", ar: "تسجيل بيع", fr: "Enregistrer vente" },
  totalSales: { en: "Total Sales", ar: "إجمالي المبيعات", fr: "Total des ventes" },
  bestSelling: { en: "Best Selling", ar: "الأكثر مبيعاً", fr: "Meilleure vente" },
  revenueByCategory: { en: "Revenue by Category", ar: "الإيرادات حسب الفئة", fr: "Revenu par catégorie" },
  customerName: { en: "Customer Name", ar: "اسم الزبون", fr: "Nom du client" },
  rabbitType: { en: "Rabbit Type", ar: "نوع الأرنب", fr: "Type de lapin" },
  saleDate: { en: "Sale Date", ar: "تاريخ البيع", fr: "Date de vente" },
  notes: { en: "Notes", ar: "ملاحظات", fr: "Notes" },
  kit: { en: "Kit", ar: "خرنق", fr: "Lapereau" },
  meatRabbit: { en: "Meat Rabbit", ar: "أرنب لحم", fr: "Lapin de chair" },
  largeRabbit: { en: "Adult Rabbit", ar: "أرنب بالغ", fr: "Lapin adulte" },
  addRecord: { en: "Add Record", ar: "إضافة سجل", fr: "Ajouter un record" },
  expenseCategory: { en: "Expense Category", ar: "فئة المصاريف", fr: "Catégorie de dépense" },
  amount: { en: "Amount", ar: "المبلغ", fr: "Montant" },
  forceSync: { en: "Force Sync", ar: "مزامنة إجبارية", fr: "Forcer la synchro" },

  // Reports
  salesVsExpenses: { en: "Sales vs Expenses", ar: "المبيعات مقابل المصاريف", fr: "Ventes vs Dépenses" },
  mortalityRate: { en: "Mortality Rate", ar: "معدل الوفيات", fr: "Taux de mortalité" },
  breedingSuccess: { en: "Breeding Success", ar: "نجاح التزاوج", fr: "Succès d'élevage" },
  productionSummary: { en: "Production Summary", ar: "ملخص الإنتاج", fr: "Résumé de production" },
  meat: { en: "Meat", ar: "لحم", fr: "Viande" },
  milk: { en: "Milk", ar: "حليب", fr: "Lait" },
  breedingOutput: { en: "Breeding Output", ar: "مخرجات التزاوج", fr: "Production d'élevage" },
  downloadPDF: { en: "Download PDF", ar: "تحميل PDF", fr: "Télécharger PDF" },

  // Profile & Settings
  neuralSettings: { en: "Neural Settings", ar: "الإعدادات العصبية", fr: "Paramètres neuraux" },
  terminateSession: { en: "Terminate Session", ar: "إنهاء الجلسة", fr: "Terminer la session" },
  identity: { en: "Identity", ar: "الهوية", fr: "Identité" },
  neuralKeys: { en: "Neural Keys", ar: "المفاتيح العصبية", fr: "Clés neurales" },
  displayName: { en: "Display Name", ar: "اسم العرض", fr: "Nom d'affichage" },
  emailAddress: { en: "Email Address", ar: "البريد الإلكتروني", fr: "Adresse e-mail" },
  saveIdentity: { en: "Save Identity", ar: "حفظ الهوية", fr: "Sauvegarder l'identité" },
  initializeUplink: { en: "Initialize Uplink", ar: "تهيئة الرابط", fr: "Initialiser le lien" },

  // Dashboard
  populationGrowth: { en: "Population Growth", ar: "نمو القطيع", fr: "Croissance de la population" },
  cageMap: { en: "Cage Map", ar: "خريطة الأقفاص", fr: "Carte des cages" },
  cageMapDesc: { en: "Visual layout of your farm nodes.", ar: "التخطيط المرئي لمزرعتك.", fr: "Disposition visuelle de votre ferme." },
  engineOnline: { en: "Engine Online", ar: "المحرك متصل", fr: "Moteur en ligne" },
  nodesLinked: { en: "Nodes Linked", ar: "عقد مرتبطة", fr: "Nœuds liés" },
  secureUplink: { en: "Secure Uplink", ar: "رابط آمن", fr: "Lien sécurisé" },
  ghardaiaNode: { en: "Ghardaia Node", ar: "عقدة غرداية", fr: "Nœud Ghardaia" },
  healthy: { en: "Healthy", ar: "سليم", fr: "Sain" },
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
  
  const t = (key: string) => {
    const translation = translations[key]?.[language];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation;
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