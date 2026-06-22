import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';
  const languages = [
    { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
    { code: 'en', label: 'English', short: 'EN' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 transition hover:bg-slate-100 hover:text-brand"
        aria-label="Change language"
      >
        <span>{currentLang.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-100 bg-white py-2 shadow-xl z-[200]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { void i18n.changeLanguage(lang.code); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50 ${
                currentLang === lang.code ? 'text-brand' : 'text-slate-600'
              }`}
            >
              {lang.label}
              {currentLang === lang.code && (
                <span className="ml-auto text-brand text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
