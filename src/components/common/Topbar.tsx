'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import styles from './Topbar.module.css';

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <Search size={18} opacity={0.5} />
        <input type="text" placeholder="Search for users, groups, or tasks..." />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <Moon size={20} />
        </button>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>
        <button className={styles.iconBtn}>
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
