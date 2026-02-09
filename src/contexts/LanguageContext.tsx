import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  heroTitle: {
    en: "Master Your Time With AI",
    fr: "Maîtrisez votre temps avec l'IA",
    ar: "تحكم في وقتك باستخدام الذكاء الاصطناعي"
  },
  heroSubtitle: {
    en: "Yobest AI is a cognitive engine that learns your rhythm and optimizes your life for peak performance.",
    fr: "Yobest AI est un moteur cognitif qui apprend votre rythme et optimise votre vie pour des performances maximales.",
    ar: "Yobest AI هو محرك معرفي يتعلم إيقاعك ويحسن حياتك لتحقيق ذروة الأداء."
  },
  getStarted: {
    en: "Get Started Free",
    fr: "Commencer Gratuitement",
    ar: "ابدأ مجاناً"
  },
  watchStory: {
    en: "Watch Story",
    fr: "Voir l'histoire",
    ar: "شاهد القصة"
  },
  usersJoined: {
    en: "users already joined",
    fr: "utilisateurs ont déjà rejoint",
    ar: "مستخدم انضموا بالفعل"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

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