'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, MessageSquare, CheckSquare, 
  LogOut, PhoneCall, Share2, Hash, 
  Smartphone, FileText, UserPlus, Heart, Smile, 
  ChevronLeft, ChevronRight, Command, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const menuGroups = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    ]
  },
  {
    title: 'Management',
    items: [
      { icon: Users, label: 'Users', href: '/users' },
      { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
      { icon: ShieldCheck, label: 'Participants', href: '/participants' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { icon: Hash, label: 'Messages', href: '/messages' },
      { icon: PhoneCall, label: 'Video Calls', href: '/calls' },
      { icon: FileText, label: 'Attachments', href: '/attachments' },
      { icon: Smile, label: 'Reactions', href: '/reactions' },
    ]
  },
  {
    title: 'Social & Tasks',
    items: [
      { icon: UserPlus, label: 'Requests', href: '/friend-requests' },
      { icon: Heart, label: 'Friends', href: '/friends' },
      { icon: CheckSquare, label: 'Shared Tasks', href: '/tasks' },
      { icon: Smartphone, label: 'Devices', href: '/devices' },
    ]
  }
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
      className={`relative h-screen flex flex-col bg-zinc-950 border-r border-zinc-900 transition-all duration-300 z-[60] ${isCollapsed ? 'w-[70px]' : 'w-64'}`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-6 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
          <Command size={20} className="text-zinc-950" />
        </div>
        {!isCollapsed && (
          <span className="text-white font-bold tracking-tight text-lg">AloAdmin</span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{group.title}</p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User & Footer */}
      <div className="p-4 border-t border-zinc-900">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0 border border-zinc-700">
            {user?.email?.[0].toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-zinc-500 font-medium truncate uppercase">{role}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={signOut}
              className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        
        {/* Toggle (Internal) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 w-full flex items-center justify-center py-1.5 text-zinc-600 hover:text-zinc-400 border border-zinc-900 rounded-md transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
