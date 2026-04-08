import React from 'react';
import { Trash2, CheckCircle, XCircle, Download } from 'lucide-react';
import styles from './ActionToolbar.module.css';

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
  if (selectedCount === 0) return null;

  return (
    <div className={`${styles.toolbar} animate-slide-up`}>
      <div className={styles.countInfo}>
        <span className={styles.badge}>{selectedCount}</span>
        <span>items selected</span>
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.actionsGroup}>
        {additionalActions?.map((action, index) => (
          <button 
            key={index} 
            className={styles.actionBtn} 
            onClick={action.onClick}
          >
            <action.icon size={18} />
            <span>{action.label}</span>
          </button>
        ))}
        
        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={onDelete}>
          <Trash2 size={18} />
          <span>Delete Selected</span>
        </button>
      </div>
    </div>
  );
}
