'use client';
import { Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTheme, THEMES } from '@/components/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const t = THEMES[theme];

  return (
    <div className="flex h-screen">
      <Suspense fallback={<aside className="w-64 bg-gray-100" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={<header className="h-16 bg-gray-100" />}>
          <Header />
        </Suspense>
        <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${t.main}`}>
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
        <Suspense fallback={<footer className="h-12 bg-gray-100" />}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}