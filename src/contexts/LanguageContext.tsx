import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  heroTitle: { en: "Smart Rabbit Farm Management", ar: "إدارة ذكية لمزارع الأرانب", fr: "Gestion Intelligente de Ferme de Lapins" },
  heroSubtitle: { en: "The ultimate platform for breeders in Ghardaia. Track growth, manage cages, and optimize your sales with neural precision.", ar: "المنصة المثالية للمربين في غرداية. تتبع النمو، أدر الأقفاص، وحسن مبيعاتك بدقة عالية.", fr: "La plateforme ultime pour les éleveurs à Ghardaia. Suivez la croissance, gérez les cages et optimisez vos ventes." },
  goDashboard: { en: "Go to Dashboard", ar: "اذهب للوحة التحكم", fr: "Aller au tableau de bord" },
  viewRabbits: { en: "View Rabbits", ar: "عرض الأرانب", fr: "Voir les lapins" },
  happyCustomers: { en: "Happy Breeders", ar: "مربي سعيد", fr: "Éleveurs satisfaits" },
  healthStatus: { en: "Health Status", ar: "الحالة الصحية", fr: "État de santé" },
  healthyRate: { en: "Healthy Rate", ar: "معدل الصحة", fr: "Taux de santé" },
  featuresTitle: { en: "Powerful Features", ar: "مميزات قوية", fr: "Fonctionnalités puissantes" },
  featuresSubtitle: { en: "Everything you need to scale your rabbit production.", ar: "كل ما تحتاجه لتوسيع إنتاج الأرانب الخاص بك.", fr: "Tout ce dont vous avez besoin pour augmenter votre production." },
  feature1Title: { en: "Growth Tracking", ar: "تتبع النمو", fr: "Suivi de croissance" },
  feature1Desc: { en: "Monitor weight gain and health metrics with real-time charts.", ar: "راقب زيادة الوزن ومقاييس الصحة مع رسوم بيانية فورية.", fr: "Surveillez le gain de poids et la santé avec des graphiques." },
  feature2Title: { en: "Cage Management", ar: "إدارة الأقفاص", fr: "Gestion des cages" },
  feature2Desc: { en: "Assign rabbits to cages and scan QR codes for instant access.", ar: "خصص الأرانب للأقفاص وامسح رموز QR للوصول الفوري.", fr: "Assignez les lapins aux cages et scannez les codes QR." },
  feature3Title: { en: "Breeding Cycles", ar: "دورات التزاوج", fr: "Cycles d'élevage" },
  feature3Desc: { en: "Automated pregnancy tracking and birth notifications.", ar: "تتبع تلقائي للحمل وإشعارات الولادة.", fr: "Suivi automatique de la grossesse et notifications." },
  ctaTitle: { en: "Ready to optimize your farm?", ar: "جاهز لتحسين مزرعتك؟", fr: "Prêt à optimiser votre ferme ?" },
  ctaSubtitle: { en: "Join hundreds of breeders in Ghardaia using Arnab Ghardaia.", ar: "انضم إلى مئات المربين في غرداية الذين يستخدمون أرنب غرداية.", fr: "Rejoignez des centaines d'éleveurs à Ghardaia." },
  getStartedFree: { en: "Get Started Free", ar: "ابدأ مجاناً", fr: "Commencer gratuitement" },
  contactSales: { en: "Contact Sales", ar: "اتصل بالمبيعات", fr: "Contacter les ventes" },
  totalRabbits: { en: "Total Rabbits", ar: "إجمالي الأرانب", fr: "Total Lapins" },
  males: { en: "Males", ar: "ذكور", fr: "Mâles" },
  females: { en: "Females", ar: "إناث", fr: "Femelles" },
  newBorns: { en: "Newborns", ar: "مواليد جدد", fr: "Nouveau-nés" },
  appName: { en: "Arnab Ghardaia", ar: "أرنب غرداية", fr: "Arnab Ghardaia" },
  save: { en: "Save Changes", ar: "حفظ التغييرات", fr: "Enregistrer" },
  home: { en: "Home", ar: "الرئيسية", fr: "Accueil" },
  login: { en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
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
  quarantined: { en: "Quarantined", ar: "في الحجر", fr: "En quarantaine" },
  recovering: { en: "Recovering", ar: "يتعافى", fr: "En récupération" },
  edit: { en: "Edit", ar: "تعديل", fr: "Modifier" },
  age: { en: "Age", ar: "العمر", fr: "Âge" },
  months: { en: "Months", ar: "أشهر", fr: "Mois" },
  days: { en: "Days", ar: "أيام", fr: "Jours" },
  cageNumber: { en: "Cage #", ar: "رقم القفص", fr: "N° Cage" },
  searchPlaceholder: { en: "Search by name or ID...", ar: "ابحث بالاسم أو الرقم...", fr: "Rechercher par nom ou ID..." },
  scanQr: { en: "Scan QR Code", ar: "مسح رمز QR", fr: "Scanner QR" },
  cameraAccess: { en: "Requesting Camera...", ar: "جاري طلب الكاميرا...", fr: "Accès caméra..." },
  weightHistory: { en: "Weight History", ar: "سجل الوزن", fr: "Historique du poids" },
  categoryYoung: { en: "Young (1 Month)", ar: "صغير (شهر)", fr: "Jeune (1 mois)" },
  categoryAdult: { en: "Adult", ar: "بالغ", fr: "Adulte" },
  categoryMeat: { en: "For Meat", ar: "للحم", fr: "Pour viande" },
  salePrice: { en: "Sale Price", ar: "سعر البيع", fr: "Prix de vente" },
  startDate: { en: "Start Date", ar: "تاريخ البدء", fr: "Date de début" },
  endDate: { en: "End Date", ar: "تاريخ الانتهاء", fr: "Date de fin" },
  downloadQr: { en: "Download QR", ar: "تحميل رمز QR", fr: "Télécharger QR" },
  downloadPDF: { en: "Download PDF", ar: "تحميل PDF", fr: "Télécharger PDF" },
  filter: { en: "Filter", ar: "تصفية", fr: "Filtrer" },
  noMatches: { en: "No matches found", ar: "لا توجد نتائج", fr: "Aucun résultat" },
  quickSearch: { en: "Quick Search...", ar: "بحث سريع...", fr: "Recherche rapide..." },
  inquire: { en: "Inquire", ar: "استفسار", fr: "S'informer" },
  recordMating: { en: "Record Mating", ar: "تسجيل تزاوج", fr: "Enregistrer saillie" },
  activePregnancies: { en: "Active Pregnancies", ar: "حالات حمل نشطة", fr: "Grossesses actives" },
  expectedBirth: { en: "Expected Birth", ar: "الولادة المتوقعة", fr: "Naissance prévue" },
  daysRemaining: { en: "Days Remaining", ar: "أيام متبقية", fr: "Jours restants" },
  mother: { en: "Mother", ar: "الأم", fr: "Mère" },
  father: { en: "Father", ar: "الأب", fr: "Père" },
  matingDate: { en: "Mating Date", ar: "تاريخ التزاوج", fr: "Date de saillie" },
  notes: { en: "Notes", ar: "ملاحظات", fr: "Notes" },
  recentActivity: { en: "Recent Activity", ar: "نشاط أخير", fr: "Activité récente" },
  viewAll: { en: "View All", ar: "عرض الكل", fr: "Voir tout" },
  quickActions: { en: "Quick Actions", ar: "إجراءات سريعة", fr: "Actions rapides" },
  populationGrowth: { en: "Population Growth", ar: "نمو القطيع", fr: "Croissance" },
  copyright: { en: "© 2026 Arnab Ghardaia. All rights reserved.", ar: "© 2026 أرنب غرداية. جميع الحقوق محفوظة.", fr: "© 2026 Arnab Ghardaia. Tous droits réservés." },
  privacyPolicy: { en: "Privacy Policy", ar: "سياسة الخصوصية", fr: "Politique de confidentialité" },
  termsOfService: { en: "Terms of Service", ar: "شروط الخدمة", fr: "Conditions d'utilisation" },
  dataSecurity: { en: "Data Security", ar: "أمن البيانات", fr: "Sécurité des بيانات" },
  dataSecurityDesc: { en: "Your farm data is encrypted and stored securely.", ar: "بيانات مزرعتك مشفرة ومخزنة بشكل آمن.", fr: "Vos données sont cryptées et sécurisées." },
  userResponsibility: { en: "User Responsibility", ar: "مسؤولية المستخدم", fr: "Responsabilité" },
  userResponsibilityDesc: { en: "You are responsible for the accuracy of your records.", ar: "أنت مسؤول عن دقة سجلاتك.", fr: "Vous êtes responsable de l'exactitude." },
  aboutHero: { en: "Pioneering Rabbit Farming in Ghardaia", ar: "ريادة تربية الأرانب في غرداية", fr: "Pionnier de l'élevage à Ghardaia" },
  aboutDesc: { en: "We combine traditional wisdom with modern technology.", ar: "نجمع بين الحكمة التقليدية والتكنولوجيا الحديثة.", fr: "Nous combinons sagesse et technologie." },
  qualityCare: { en: "Quality Care", ar: "رعاية عالية الجودة", fr: "Soins de qualité" },
  qualityDesc: { en: "Every rabbit is raised with the highest standards.", ar: "يتم تربية كل أرنب بأعلى المعايير.", fr: "Chaque lapin est élevé selon les normes." },
  contactHero: { en: "Get in Touch", ar: "تواصل معنا", fr: "Contactez-nous" },
  contactDesc: { en: "Have questions? Our team is here to help.", ar: "لديك أسئلة؟ فريقنا هنا للمساعدة.", fr: "Des questions ? Notre équipe est là." },
  whatsappChat: { en: "Chat on WhatsApp", ar: "تحدث عبر واتساب", fr: "Chatter sur WhatsApp" },
  fullName: { en: "Full Name", ar: "الاسم الكامل", fr: "Nom complet" },
  emailAddress: { en: "Email Address", ar: "البريد الإلكتروني", fr: "Adresse e-mail" },
  message: { en: "Message", ar: "الرسالة", fr: "Message" },
  sendMessage: { en: "Send Message", ar: "إرسال الرسالة", fr: "Envoyer" },
  profile: { en: "Profile", ar: "الملف الشخصي", fr: "Profil" },
  medicalHistory: { en: "Medical History", ar: "السجل الطبي", fr: "Historique médical" },
  vaccinationStatus: { en: "Vaccination Status", ar: "حالة التطعيم", fr: "Statut vaccinal" },
  lineage: { en: "Lineage", ar: "النسب", fr: "Lignée" },
  cageMap: { en: "Cage Map", ar: "خريطة الأقفاص", fr: "Plan des cages" },
  vaccinated: { en: "Vaccinated", ar: "مُطعم", fr: "Vacciné" },
  notVaccinated: { en: "Not Vaccinated", ar: "غير مُطعم", fr: "Non vacciné" },
  sales: { en: "Sales", ar: "المبيعات", fr: "Ventes" },
  recordSale: { en: "Record Sale", ar: "تسجيل عملية بيع", fr: "Enregistrer une vente" },
  saleDate: { en: "Sale Date", ar: "تاريخ البيع", fr: "Date de vente" },
  customerName: { en: "Customer Name", ar: "اسم المشتري", fr: "Nom du client" },
  rabbitType: { en: "Rabbit Type", ar: "نوع الأرنب", fr: "Type de lapin" },
  kit: { en: "Kit (Young)", ar: "خرنق (صغير)", fr: "Lapereau" },
  meatRabbit: { en: "Meat Rabbit", ar: "أرنب لحم", fr: "Lapin de chair" },
  largeRabbit: { en: "Large Rabbit", ar: "أرنب كبير", fr: "Grand lapin" },
  totalSales: { en: "Total Sales", ar: "إجمالي المبيعات", fr: "Ventes totales" },
  bestSelling: { en: "Best Selling", ar: "الأكثر مبيعاً", fr: "Meilleures ventes" },
  revenueByCategory: { en: "Revenue by Category", ar: "الإيرادات حسب الفئة", fr: "Revenu par catégorie" },
  helpSelectRabbit: { en: "Start typing to find a rabbit from your inventory.", ar: "ابدأ الكتابة للعثور على أرنب من مخزونك.", fr: "Commencez à taper pour trouver un lapin." },
  helpCustomer: { en: "Enter the buyer's name for your records.", ar: "أدخل اسم المشتري لسجلاتك.", fr: "Entrez le nom de l'acheteur." },
  helpMatingDate: { en: "The expected birth date will be calculated automatically (31 days).", ar: "سيتم حساب تاريخ الولادة المتوقع تلقائياً (31 يوماً).", fr: "La date de naissance sera calculée automatiquement." },
  successRate: { en: "Breeding Success Rate", ar: "معدل نجاح التزاوج", fr: "Taux de réussite" },
  publishToShop: { en: "Publish to Boutique", ar: "نشر في المتجر", fr: "Publier en Boutique" },
  publishDesc: { en: "Make this rabbit visible to public buyers in the Boutique.", ar: "اجعل هذا الأرنب مرئياً للمشترين في المتجر العام.", fr: "Rendre ce lapin visible dans la Boutique." },
  cageMapDesc: { en: "Visual overview of your farm's housing capacity.", ar: "نظرة عامة مرئية على سعة استيعاب مزرعتك.", fr: "Aperçu visuel de la capacité de votre ferme." },
  medical: { en: "Medical", ar: "طبي", fr: "Médical" },
  breedingHistory: { en: "Breeding History", ar: "سجل التزاوج", fr: "Historique d'élevage" },
  kitsAlive: { en: "Kits Alive", ar: "مواليد أحياء", fr: "Lapereaux vivants" },
  kitsDead: { en: "Kits Dead", ar: "مواليد نافقة", fr: "Lapereaux morts" },
  matingPartner: { en: "Mating Partner", ar: "شريك التزاوج", fr: "Partenaire de saillie" },
  actualBirthDate: { en: "Actual Birth Date", ar: "تاريخ الولادة الفعلي", fr: "Date de naissance réelle" },
  totalKits: { en: "Total Kits", ar: "إجمالي المواليد", fr: "Total lapereaux" },
  basicInfo: { en: "Basic Info", ar: "معلومات أساسية", fr: "Infos de base" },
  history: { en: "History", ar: "السجل", fr: "Historique" },
  critical: { en: "Critical", ar: "حرج", fr: "Critique" },
  breedSelection: { en: "Breed Selection", ar: "اختيار السلالة", fr: "Sélection de race" },
  rabbitName: { en: "Rabbit Name", ar: "اسم الأرنب", fr: "Nom du lapin" },
  genderSelection: { en: "Gender Selection", ar: "اختيار الجنس", fr: "Sélection du sexe" },
  birthDate: { en: "Birth Date", ar: "تاريخ الميلاد", fr: "Date de naissance" },
  weightKg: { en: "Weight (kg)", ar: "الوزن (كجم)", fr: "Poids (kg)" },
  motherId: { en: "Mother ID", ar: "رقم الأم", fr: "ID Mère" },
  fatherId: { en: "Father ID", ar: "رقم الأب", fr: "ID Père" },
  vaccination: { en: "Vaccination", ar: "التطعيم", fr: "Vaccination" },
  medicalNotes: { en: "Medical Notes", ar: "ملاحظات طبية", fr: "Notes médicales" },
  addRecord: { en: "Add Record", ar: "إضافة سجل", fr: "Ajouter un record" },
  litters: { en: "Litters", ar: "البطون", fr: "Portées" },
  expenses: { en: "Expenses", ar: "المصاريف", fr: "Dépenses" },
  production: { en: "Production", ar: "الإنتاج", fr: "Production" },
  cageType: { en: "Cage Type", ar: "نوع القفص", fr: "Type de cage" },
  cageTypeYoung: { en: "Young", ar: "صغار", fr: "Jeunes" },
  cageTypeMales: { en: "Males Only", ar: "ذكور فقط", fr: "Mâles uniquement" },
  cageTypeFemales: { en: "Females Only", ar: "إناث فقط", fr: "Femelles uniquement" },
  cageTypeMating: { en: "Mating Pairs", ar: "أزواج تزاوج", fr: "Couples" },
  splitLitter: { en: "Split Litter", ar: "فصل البطن", fr: "Séparer la portée" },
  kitsBorn: { en: "Kits Born", ar: "المواليد", fr: "Lapereaux nés" },
  deathReason: { en: "Death Reason", ar: "سبب النفوق", fr: "Raison du décès" },
  weaningDate: { en: "Weaning Date", ar: "تاريخ الفطام", fr: "Date de sevrage" },
  expenseCategory: { en: "Category", ar: "الفئة", fr: "Catégorie" },
  expenseFood: { en: "Food", ar: "علف", fr: "Nourriture" },
  expenseWater: { en: "Water", ar: "ماء", fr: "Eau" },
  expenseMedicine: { en: "Medicine", ar: "دواء", fr: "Médicament" },
  expenseEquipment: { en: "Equipment", ar: "معدات", fr: "Équipement" },
  expenseLosses: { en: "Losses", ar: "خسائر", fr: "Pertes" },
  expenseOther: { en: "Other", ar: "أخرى", fr: "Autre" },
  amount: { en: "Amount", ar: "المبلغ", fr: "Montant" },
  mortalityRate: { en: "Mortality Rate", ar: "معدل النفوق", fr: "Taux de mortalité" },
  breedingSuccess: { en: "Breeding Success", ar: "نجاح التزاوج", fr: "Succès d'élevage" },
  salesVsExpenses: { en: "Sales vs Expenses", ar: "المبيعات مقابل المصاريف", fr: "Ventes vs Dépenses" },
  productionSummary: { en: "Production Summary", ar: "ملخص الإنتاج", fr: "Résumé de production" },
  milk: { en: "Milk", ar: "حليب", fr: "Lait" },
  meat: { en: "Meat", ar: "لحم", fr: "Viande" },
  breedingOutput: { en: "Breeding Output", ar: "مخرجات التزاوج", fr: "Production d'élevage" },
  forceSync: { en: "Force Sync", ar: "مزامنة إجبارية", fr: "Forcer la synchro" },
  refresh: { en: "Refresh", ar: "تحديث", fr: "Actualiser" },
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