'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  CheckSquare, 
  Settings, 
  ShieldAlert,
  LogOut,
  Infinity
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: ShieldAlert, label: 'Security', href: '/security' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Infinity size={32} />
        <span>Alo Admin</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Administrator</span>
            <span className={styles.userRole}>Super Admin</span>
          </div>
          <LogOut size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </div>
      </div>
    </aside>
  );
}
