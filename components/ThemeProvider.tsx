'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeKey = 'light' | 'blue' | 'gradient';

export const THEMES: Record<
  ThemeKey,
  {
    label: string;
    // Сайдбар
    aside: string;
    asideTitle: string;
    asideLink: string;
    asideLinkActive: string;
    asideLinkHover: string;
    asideSubLink: string;
    asideSubLinkActive: string;
    asideSubLinkHover: string;
    asideBadge: string;
    asideBadgeActive: string;
    asideFooter: string;
    asideBorder: string;
    // Header
    header: string;
    headerBorder: string;
    headerText: string;
    headerInput: string;
    headerButton: string;
    // Main
    main: string;
    // Footer
    footer: string;
    footerBorder: string;
    footerText: string;
  }
> = {
  light: {
    label: 'Светлая',
    aside: 'bg-white border-r border-gray-200 text-gray-700',
    asideTitle: 'text-gray-900 border-gray-200',
    asideLink: 'text-gray-700',
    asideLinkActive: 'bg-blue-50 text-blue-700 font-medium',
    asideLinkHover: 'hover:bg-gray-100',
    asideSubLink: 'text-gray-600',
    asideSubLinkActive: 'text-blue-700 font-medium bg-blue-50',
    asideSubLinkHover: 'hover:text-gray-900 hover:bg-gray-100',
    asideBadge: 'bg-gray-100 text-gray-600',
    asideBadgeActive: 'bg-blue-100 text-blue-700',
    asideFooter: 'text-gray-400 border-gray-200',
    asideBorder: 'border-gray-200',
    header: 'bg-white',
    headerBorder: 'border-gray-200',
    headerText: 'text-gray-700',
    headerInput: 'border-gray-300 focus:ring-blue-500',
    headerButton: 'border-gray-300 text-gray-700 hover:bg-gray-50',
    main: 'bg-gray-100',
    footer: 'bg-white',
    footerBorder: 'border-gray-200',
    footerText: 'text-gray-500',
  },
  blue: {
    label: 'Голубая',
    aside: 'bg-sky-50 border-r border-sky-200 text-sky-900',
    asideTitle: 'text-sky-900 border-sky-200',
    asideLink: 'text-sky-800',
    asideLinkActive: 'bg-sky-200 text-sky-900 font-medium',
    asideLinkHover: 'hover:bg-sky-100',
    asideSubLink: 'text-sky-700',
    asideSubLinkActive: 'text-sky-900 font-medium bg-sky-200',
    asideSubLinkHover: 'hover:text-sky-900 hover:bg-sky-100',
    asideBadge: 'bg-sky-100 text-sky-700',
    asideBadgeActive: 'bg-sky-300 text-sky-900',
    asideFooter: 'text-sky-500 border-sky-200',
    asideBorder: 'border-sky-200',
    header: 'bg-sky-50',
    headerBorder: 'border-sky-200',
    headerText: 'text-sky-900',
    headerInput: 'border-sky-300 focus:ring-sky-500',
    headerButton: 'border-sky-300 text-sky-800 hover:bg-sky-100',
    main: 'bg-sky-100',
    footer: 'bg-sky-50',
    footerBorder: 'border-sky-200',
    footerText: 'text-sky-600',
  },
  gradient: {
    label: 'Градиент',
    aside:
      'bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 border-r border-purple-700 text-white',
    asideTitle: 'text-white border-purple-500',
    asideLink: 'text-white/90',
    asideLinkActive: 'bg-white/20 text-white font-medium',
    asideLinkHover: 'hover:bg-white/10',
    asideSubLink: 'text-white/80',
    asideSubLinkActive: 'text-white font-medium bg-white/20',
    asideSubLinkHover: 'hover:text-white hover:bg-white/10',
    asideBadge: 'bg-white/20 text-white',
    asideBadgeActive: 'bg-white/30 text-white',
    asideFooter: 'text-white/60 border-purple-500',
    asideBorder: 'border-purple-500',
    header: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    headerBorder: 'border-purple-700',
    headerText: 'text-white',
    headerInput: 'border-white/30 bg-white/10 text-white placeholder-white/60 focus:ring-white/50',
    headerButton: 'border-white/30 text-white hover:bg-white/10',
    main: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
    footer: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    footerBorder: 'border-purple-700',
    footerText: 'text-white/80',
  },
};

type ThemeContextValue = {
  theme: ThemeKey;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>('light');

  useEffect(() => {
    const saved = localStorage.getItem('site-theme') as ThemeKey | null;
    if (saved && THEMES[saved]) setTheme(saved);
  }, []);

  const cycleTheme = () => {
    const keys: ThemeKey[] = ['light', 'blue', 'gradient'];
    const next = keys[(keys.indexOf(theme) + 1) % keys.length];
    setTheme(next);
    localStorage.setItem('site-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}