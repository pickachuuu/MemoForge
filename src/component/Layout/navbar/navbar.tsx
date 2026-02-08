'use client';

import { navItems } from "./navConfig";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logout01Icon, Menu01Icon, Cancel01Icon, DashboardSpeed01Icon } from "hugeicons-react";
import { useState } from "react";
import { signOut } from '@/hook/useAuthActions';
import { NotebookIcon, FlashcardIcon, ExamIcon } from '@/component/icons';

const getNavIcon = (href: string) => {
  switch (href) {
    case '/dashboard': return <DashboardSpeed01Icon className="w-6 h-6" />;
    case '/library': return <NotebookIcon className="w-6 h-6" />;
    case '/flashcards': return <FlashcardIcon className="w-6 h-6" />;
    case '/exams': return <ExamIcon className="w-6 h-6" />;
    default: return null;
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ═══════════════ Desktop Sidebar ═══════════════ */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col bg-surface border-r border-border shadow-[4px_0_24px_rgba(60,50,40,0.08)]">
        {/* Logo */}
        <div className="px-5 pt-6 pb-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-background-muted border border-border shadow-sm"
            >
              <span className="text-primary font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-foreground transition-colors tracking-tight">
              MemoForge
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-background-muted text-foreground border-pencil/40 shadow-sm relative after:content-[''] after:absolute after:left-4 after:right-4 after:bottom-2 after:h-[2px] after:bg-pencil/50 after:rounded-full"
                    : 'text-foreground-muted border-transparent hover:bg-background-muted hover:text-foreground hover:border-border'
                }`}
              >
                {getNavIcon(item.href)}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-3 pb-6 mt-auto">
          <div className="h-px mx-3 mb-4 bg-gradient-to-r from-transparent via-border to-transparent" />
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-foreground-muted hover:text-error hover:bg-error/10"
          >
            <Logout01Icon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══════════════ Mobile Top Bar ═══════════════ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-3 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-background-muted border border-border shadow-sm"
              >
                <span className="text-primary font-bold text-base">M</span>
              </div>
              <span className="text-lg font-bold text-foreground">MemoForge</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl transition-colors text-foreground-muted hover:text-foreground hover:bg-background-muted"
            >
              {mobileMenuOpen ? <Cancel01Icon className="w-5 h-5" /> : <Menu01Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="px-4 pb-4 bg-surface border-t border-border shadow-md">
            <nav className="space-y-1 pt-2">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                      isActive
                        ? 'bg-background-muted text-foreground border-pencil/40 shadow-sm'
                        : 'text-foreground-muted border-transparent hover:bg-background-muted hover:text-foreground hover:border-border'
                    }`}
                  >
                    {getNavIcon(item.href)}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </>
  );
}
