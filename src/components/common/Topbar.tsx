'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, Settings, Command } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeContext';

interface TopbarProps {
  isSidebarCollapsed: boolean;
}

export default function Topbar({ isSidebarCollapsed }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-950 focus:border-zinc-400 dark:focus:border-zinc-600 rounded-xl text-sm outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2 text-zinc-500 hover:text-foreground-base hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="p-2 text-zinc-500 hover:text-foreground-base hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-zinc-950 dark:bg-white rounded-full ring-2 ring-background-base"></span>
        </button>

        <div className="w-[1px] h-4 bg-border mx-2"></div>

        <button className="p-2 text-zinc-500 hover:text-foreground-base hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
