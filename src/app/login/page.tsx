'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng nhập';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const webClientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: webClientId ? {
            access_type: 'offline',
            prompt: 'consent',
            client_id: webClientId
          } : undefined
        },
      });
      if (authError) throw authError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi đăng nhập Google';
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hiệu ứng dòng tin nhắn bay vô tận */}
      <div className={styles.messageStream}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`${styles.streamItem} ${styles[`item${(i % 4) + 1}`]}`}>
            {i % 2 === 0 ? 'Dự án đã hoàn thành! 🚀' : 'Họp lúc 2h nhé?'}
          </div>
        ))}
        {[...Array(12)].map((_, i) => (
          <div key={i + 12} className={`${styles.streamItem} ${styles[`item${(i % 4) + 1}`]}`} style={{ animationDelay: '4s' }}>
            {i % 3 === 0 ? 'Check mail giúp mình' : 'Chào buổi sáng! ☀️'}
          </div>
        ))}
      </div>

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>A</div>
          <h1>Alo Admin</h1>
          <p>Hệ thống quản trị thông minh</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@alo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>HOẶC</span>
        </div>

        <button onClick={handleGoogleLogin} className={styles.googleButton}>
          <img src="/google-icon.svg" alt="Google" width={18} height={18} />
          <span>Tiếp tục với Google</span>
        </button>
      </div>
    </div>
  );
}
