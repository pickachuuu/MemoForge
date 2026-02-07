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
    <div className="min-h-screen memoforge-bg flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4 max-w-7xl relative flex-1">
        {children}
      </main>
    </div>
  );
}
