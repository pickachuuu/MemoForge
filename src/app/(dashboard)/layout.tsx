'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/component/Layout/navbar/navbar";

export default function DashboardLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Safety: ensure body scroll is never stuck hidden after page navigation
  useEffect(() => {
    document.body.style.overflow = '';
  }, [pathname]);

  return (
    <div className="min-h-screen memoforge-bg">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl main-content relative">
        {children}
      </main>
    </div>
  );
}
