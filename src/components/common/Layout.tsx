'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import UserPortal from '@/components/user/UserPortal';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { user, role, loading, signOut } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isPublicPage = pathname === '/login' || pathname === '/auth/callback';

  // Always render public pages without any auth wrapping
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Show spinner while auth is initializing or session is being cleared
  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <p className="mt-4 text-zinc-500 text-sm font-medium">Đang tải...</p>
      </div>
    );
  }

  // Role: user → Personal portal (only sees own data)
  if (role === 'user') {
    return <UserPortal />;
  }

  // Role: admin or super_admin → Full admin dashboard
  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors duration-200 overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar isSidebarCollapsed={isSidebarCollapsed} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-zinc-100 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
