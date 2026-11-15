'use client';
import { useTheme, THEMES } from '@/components/ThemeProvider';

export default function Footer() {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const year = new Date().getFullYear();

  return (
    <footer className={`h-12 border-t text-sm flex items-center justify-center transition-colors duration-300 ${t.footer} ${t.footerBorder} ${t.footerText}`}>
      © {year} Laptop Inventory — учебный проект
    </footer>
  );
}