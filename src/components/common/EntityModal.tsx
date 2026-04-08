import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Eye } from 'lucide-react';
import styles from './EntityModal.module.css';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  title: string;
  onSave?: (updatedEntity: any) => Promise<boolean>;
  readOnlyFields?: string[];
}

export default function EntityModal({
  isOpen,
  onClose,
  entity,
  title,
  onSave,
  readOnlyFields = ['id', 'created_at', 'updated_at', 'conversation_id', 'current_user_id']
}: EntityModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entity) {
      setFormData({ ...entity });
      setIsEditing(false);
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    const success = await onSave(formData);
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const renderField = (key: string, value: any) => {
    const isReadOnly = readOnlyFields.includes(key);
    
    // Skip internal fields if not editing
    if (!isEditing && (key.includes('key') || key.includes('hash'))) return null;

    return (
      <div key={key} className={styles.fieldGroup}>
        <label className={styles.label}>{key.replace(/_/g, ' ')}</label>
        {isEditing && !isReadOnly ? (
          typeof value === 'boolean' ? (
            <select 
              className={styles.input} 
              value={String(formData[key])} 
              onChange={(e) => handleChange(key, e.target.value === 'true')}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          ) : (
            <input 
              className={styles.input} 
              type="text" 
              value={formData[key] || ''} 
              onChange={(e) => handleChange(key, e.target.value)}
            />
          )
        ) : (
          <div className={`${styles.valueDisplay} ${isReadOnly ? styles.readOnly : ''}`}>
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value ?? 'N/A')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>{title}</h2>
            <span className={styles.subtitle}>ID: {entity.id || entity.conversation_id}</span>
          </div>
          <div className={styles.headerActions}>
            {onSave && (
              <button 
                className={`${styles.actionBtn} ${isEditing ? styles.active : ''}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Eye size={18} /> : <Edit3 size={18} />}
                <span>{isEditing ? 'View Mode' : 'Edit Mode'}</span>
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={`${styles.content} custom-scrollbar`}>
          <div className={styles.grid}>
            {Object.entries(formData).map(([key, value]) => renderField(key, value))}
          </div>
        </div>

        {isEditing && (
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button 
              className={styles.saveBtn} 
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
