'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Eye, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  title: string;
  onSave?: (updatedEntity: any) => Promise<boolean>;
  readOnlyFields?: string[];
  mode?: 'view' | 'edit' | 'create';
}

export default function EntityModal({
  isOpen,
  onClose,
  entity,
  title,
  onSave,
  readOnlyFields = ['id', 'created_at', 'updated_at', 'conversation_id', 'current_user_id'],
  mode = 'view'
}: EntityModalProps) {
  const [currentMode, setCurrentMode] = useState<'view' | 'edit' | 'create'>(mode);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentMode(mode);
    if (entity) {
      setFormData({ ...entity });
    } else {
      setFormData({});
    }
  }, [entity, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
    setIsSaving(false);
  };

  const renderField = (key: string, value: any) => {
    const isReadOnly = readOnlyFields.includes(key);
    const isEditing = currentMode !== 'view';
    
    if (currentMode === 'view' && (key.includes('key') || key.includes('hash') || key === 'fts_search')) return null;

    return (
      <div key={key} className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          {key.replace(/_/g, ' ')}
        </label>
        
        {isEditing && !isReadOnly ? (
          key === 'role' ? (
            <select 
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
              value={formData[key] || 'user'} 
              onChange={(e) => handleChange(key, e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          ) : typeof value === 'boolean' ? (
            <select 
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
              value={String(formData[key])} 
              onChange={(e) => handleChange(key, e.target.value === 'true')}
            >
              <option value="true">True / Nam</option>
              <option value="false">False / Nữ</option>
            </select>
          ) : (
            <input 
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
              type={key === 'email' ? 'email' : 'text'} 
              value={formData[key] || ''} 
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`Nhập ${key.replace(/_/g, ' ')}...`}
            />
          )
        ) : (
          <div className={`px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 border border-transparent rounded-xl text-sm font-semibold text-slate-900 dark:text-white ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {typeof value === 'boolean' ? (value ? 'Yes / Nam' : 'No / Nữ') : String(value ?? 'N/A')}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/5"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
              {entity?.id && <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">ID: {entity.id}</p>}
            </div>
            
            <div className="flex items-center gap-2">
              {onSave && currentMode === 'view' && (
                <button 
                  onClick={() => setCurrentMode('edit')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-sm"
                >
                  <Edit3 size={16} />
                  Chỉnh sửa
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(formData).map(([key, value]) => renderField(key, value))}
              {currentMode === 'create' && Object.keys(formData).length === 0 && (
                <p className="text-slate-500 text-sm italic">Vui lòng nhập các thông tin cần thiết...</p>
              )}
            </div>
          </div>

          {/* Footer */}
          {currentMode !== 'view' && (
            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                onClick={currentMode === 'create' ? onClose : () => setCurrentMode('view')}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {currentMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
