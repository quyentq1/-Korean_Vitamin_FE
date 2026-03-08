import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

/**
 * Language Switcher Component
 * Toggle between Vietnamese and English
 */
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-sm font-medium text-gray-700"
      title="Switch Language / Đổi ngôn ngữ"
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">
        {i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
      </span>
      <span className="sm:hidden">
        {i18n.language === 'vi' ? 'VI' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
