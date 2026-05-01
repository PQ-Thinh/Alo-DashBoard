'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isPublicPage = pathname === '/login' || pathname === '/auth/callback';

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!user) return null;

  if (role === 'user') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Truy cập bị từ chối</h1>
        <p className="text-slate-500 mb-8 max-w-md">Tài khoản của bạn không có quyền truy cập vào Dashboard này. Vui lòng liên hệ quản trị viên.</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all"
        >
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark transition-colors duration-500 overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar isSidebarCollapsed={isSidebarCollapsed} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
