'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, MessageSquare, CheckSquare, 
  LogOut, Infinity, PhoneCall, Share2, Hash, 
  Smartphone, FileText, UserPlus, Smile, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/' },
  { icon: Users, label: 'Người dùng', href: '/users' },
  { icon: MessageSquare, label: 'Hội thoại', href: '/conversations' },
  { icon: Hash, label: 'Tin nhắn', href: '/messages' },
  { icon: PhoneCall, label: 'Cuộc gọi', href: '/calls' },
  { icon: CheckSquare, label: 'Công việc', href: '/tasks' },
  { icon: Share2, label: 'Mạng xã hội', href: '/social' },
  { icon: Smartphone, label: 'Thiết bị', href: '/devices' },
  { icon: FileText, label: 'Tệp đính kèm', href: '/attachments' },
  { icon: UserPlus, label: 'Thành viên', href: '/participants' },
  { icon: Smile, label: 'Cảm xúc', href: '/reactions' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();

  return (
    <aside 
      className={`relative bg-[#020617] text-slate-300 h-screen transition-all duration-500 flex flex-col z-50 border-r border-white/5 ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl z-50 hover:scale-110 transition-transform border border-slate-200"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={`p-8 flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <Infinity size={22} className="text-slate-900" />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">Alo Admin</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-white/10 text-white font-bold ring-1 ring-white/20' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={19} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                  {!isCollapsed && (
                    <span className="text-sm tracking-tight">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Card */}
      <div className={`p-6 mt-auto border-t border-white/5 bg-white/[0.02] ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-bold text-white shrink-0 border border-white/10">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate tracking-tight text-white">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{role}</p>
            </div>
          )}
          <button 
            onClick={signOut}
            className="p-2 text-slate-600 hover:text-white transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
