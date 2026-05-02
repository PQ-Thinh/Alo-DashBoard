'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Loader2, Info } from 'lucide-react';
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
    
    // Hide technical internal fields in view mode
    if (currentMode === 'view' && (key.includes('key') || key.includes('hash') || key === 'fts_search')) return null;

    const labelText = key.replace(/_/g, ' ');
    const isLongContent = String(value ?? '').length > 50;

    return (
      <div key={key} className={`flex flex-col gap-1.5 ${isLongContent && currentMode === 'view' ? 'md:col-span-2' : ''}`}>
        <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.15em] px-0.5">
          {labelText}
        </label>
        
        {isEditing && !isReadOnly ? (
          <div className="relative group">
            {key === 'role' ? (
              <select 
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-zinc-950 dark:focus:border-white outline-none transition-all text-sm font-bold appearance-none" 
                value={formData[key] || 'user'} 
                onChange={(e) => handleChange(key, e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            ) : typeof value === 'boolean' ? (
              <select 
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-zinc-950 dark:focus:border-white outline-none transition-all text-sm font-bold appearance-none" 
                value={String(formData[key])} 
                onChange={(e) => handleChange(key, e.target.value === 'true')}
              >
                <option value="true">True / Nam</option>
                <option value="false">False / Nữ</option>
              </select>
            ) : (
              <input 
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-zinc-950 dark:focus:border-white outline-none transition-all text-sm font-bold" 
                type={key === 'email' ? 'email' : 'text'} 
                value={formData[key] || ''} 
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`Enter ${labelText}...`}
              />
            )}
          </div>
        ) : (
          <div className={`
            px-4 py-3 rounded-xl text-sm font-bold transition-all border-2
            ${isReadOnly 
              ? 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-500' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'}
            ${isLongContent ? 'max-h-32 overflow-y-auto custom-scrollbar whitespace-pre-wrap break-words' : 'truncate'}
          `}>
            {typeof value === 'boolean' ? (value ? 'Yes / Nam' : 'No / Nữ') : (value === null || value === undefined ? '—' : String(value))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
        />
        
        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-zinc-50 dark:bg-zinc-950 rounded-[32px] shadow-2xl overflow-hidden border-2 border-white dark:border-zinc-800 flex flex-col"
        >
          {/* Top Bar with Icon & Close */}
          <div className="px-8 pt-8 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                {currentMode === 'view' ? <Info className="text-zinc-400" size={20} /> : <Edit3 className="text-indigo-500" size={20} />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight leading-none">{title}</h2>
                <p className="text-[10px] text-zinc-400 font-black mt-2 uppercase tracking-[0.2em] opacity-60">
                  {currentMode === 'view' ? 'Entity View' : currentMode === 'edit' ? 'Update Records' : 'New Entry'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="px-8 py-6 flex-1 overflow-y-auto custom-scrollbar max-h-[55vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {Object.entries(formData).map(([key, value]) => renderField(key, value))}
            </div>
            
            {entity?.id && (
              <div className="mt-8 pt-6 border-t-2 border-zinc-100 dark:border-zinc-900 flex flex-col gap-1 opacity-40">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Global Resource Identifier</p>
                <code className="text-[10px] font-mono text-zinc-500 break-all">{entity.id}</code>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="px-8 py-6 bg-white dark:bg-zinc-900 border-t-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              {onSave && currentMode === 'view' && (
                <button 
                  onClick={() => setCurrentMode('edit')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-zinc-950/20 dark:shadow-white/10 hover:scale-105 active:scale-95"
                >
                  <Edit3 size={14} />
                  Edit Record
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              {currentMode !== 'view' && (
                <>
                  <button 
                    onClick={currentMode === 'create' ? onClose : () => setCurrentMode('view')}
                    className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {currentMode === 'create' ? 'Create' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
