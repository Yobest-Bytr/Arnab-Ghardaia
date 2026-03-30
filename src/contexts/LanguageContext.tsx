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
  
  // Inventory Actions & Modals
  view: { en: "View", ar: "عرض", fr: "Voir" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  qrCode: { en: "QR Code", ar: "رمز QR", fr: "Code QR" },
  rabbitDetails: { en: "Rabbit Details", ar: "تفاصيل الأرنب", fr: "Détails du Lapin" },
  editRabbit: { en: "Edit Rabbit", ar: "تعديل الأرنب", fr: "Modifier le Lapin" },
  deleteConfirm: { en: "Are you sure you want to delete this rabbit?", ar: "هل أنت متأكد من حذف هذا الأرنب؟", fr: "Êtes-vous sûr de vouloir supprimer ce lapin ?" },
  deleteSuccess: { en: "Rabbit removed successfully.", ar: "تمت إزالة الأرنب بنجاح.", fr: "Lapin supprimé avec succès." },
  updateSuccess: { en: "Rabbit updated successfully.", ar: "تم تحديث بيانات الأرنب بنجاح.", fr: "Lapin mis à jour avec succès." },
  
  // Inventory Form
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
  searchPlaceholder: { en: "Search by name or ID...", ar: "ابحث بالاسم أو المعرف...", fr: "Rechercher par nom..." },
  unnamed: { en: "Unnamed", ar: "بدون اسم", fr: "Sans nom" },
  notAvailable: { en: "N/A", ar: "غير متوفر", fr: "N/A" },

  // AI & Neural Lab
  neuralLab: { en: "Neural Lab", ar: "المختبر العصبي", fr: "Labo Neural" },
  neuralArchitect: { en: "Neural Architect", ar: "المهندس العصبي", fr: "Architecte Neural" },
  workspace: { en: "Workspace", ar: "مساحة العمل", fr: "Espace de travail" },
  livePreview: { en: "Live Preview", ar: "معاينة مباشرة", fr: "Aperçu en direct" },
  aiActionExecuted: { en: "Neural Action Executed", ar: "تم تنفيذ الإجراء العصبي", fr: "Action Neurale Exécutée" },
  
  // Hero & Index
  heroTitle: { en: "Smart Rabbit Farm Management", ar: "إدارة ذكية لمزارع الأرانب", fr: "Gestion Intelligente de Ferme" },
  heroSubtitle: { en: "The ultimate platform for breeders in Ghardaia. Track growth, manage cages, and optimize your sales with neural precision.", ar: "المنصة المثالية للمربين في غرداية. تتبع النمو، أدر الأقفاص، وحسن مبيعاتك بدقة عالية.", fr: "La plateforme ultime pour les éleveurs à Ghardaia. Suivez la croissance et optimisez vos ventes." },
  goDashboard: { en: "Go to Dashboard", ar: "اذهب للوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Rabbits", ar: "عرض الأرانب", fr: "Voir les lapins" },
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب", fr: "Total Lapins" },
  males: { en: "Males", ar: "ذكور", fr: "Mâles" },
  females: { en: "Females", ar: "إناث", fr: "Femelles" },
  newBorns: { en: "Newborns", ar: "مواليد جدد", fr: "Nouveau-nés" },
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