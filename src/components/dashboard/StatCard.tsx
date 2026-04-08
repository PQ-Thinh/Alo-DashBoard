import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './Dashboard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendIsUp?: boolean;
}

export default function StatCard({ title, value, icon: Icon, trend, trendIsUp }: StatCardProps) {
  return (
    <div className={`${styles.statCard} glass-panel`}>
      <div className={styles.statIcon}>
        <Icon size={24} />
      </div>
      <div className={styles.statContent}>
        <span className={styles.statTitle}>{title}</span>
        <h3 className={styles.statValue}>{value}</h3>
        {trend && (
          <span className={`${styles.statTrend} ${trendIsUp ? styles.trendUp : styles.trendDown}`}>
            {trendIsUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
