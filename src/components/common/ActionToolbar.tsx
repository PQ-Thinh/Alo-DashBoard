'use client';

import React from 'react';
import { Trash2, CheckCircle, XCircle, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  additionalActions?: {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
  }[];
}

export default function ActionToolbar({ selectedCount, onDelete, additionalActions }: ActionToolbarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div 
          initial={{ y: 100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 100, x: '-50%', opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-6 px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl shadow-primary/20 border border-white/10 min-w-[400px]"
        >
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-sm">
              {selectedCount}
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-300">Đã chọn</span>
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            {additionalActions?.map((action, index) => (
              <button 
                key={index} 
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-sm font-bold" 
                onClick={action.onClick}
              >
                <action.icon size={18} className="text-primary" />
                <span>{action.label}</span>
              </button>
            ))}
            
            <button 
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-bold ml-auto" 
              onClick={onDelete}
            >
              <Trash2 size={18} />
              <span>Xóa tất cả</span>
            </button>
          </div>

          <button className="p-1 hover:bg-white/10 rounded-lg transition-all text-slate-500">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
