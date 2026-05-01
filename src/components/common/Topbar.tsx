'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, User, MessageCircle } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeContext';

interface TopbarProps {
  isSidebarCollapsed: boolean;
}

export default function Topbar({ isSidebarCollapsed }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b px-8 h-20 flex items-center justify-between transition-colors duration-500">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-foreground transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-full pl-8 pr-4 py-2 bg-transparent border-none text-sm font-medium outline-none placeholder:text-foreground/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-foreground/5 text-foreground/60 transition-all"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button className="p-2 rounded hover:bg-foreground/5 text-foreground/60 transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-foreground rounded-full border border-background-base"></span>
          </button>
        </div>

        <div className="h-6 w-[1px] bg-foreground/10 mx-2"></div>

        <button className="flex items-center gap-3 p-1 rounded-full hover:bg-foreground/5 transition-all">
          <div className="w-8 h-8 rounded-full bg-foreground text-background-base flex items-center justify-center font-black text-xs">
            <User size={16} />
          </div>
          <span className="text-sm font-bold hidden md:block">Account</span>
        </button>
      </div>
    </header>
  );
}
