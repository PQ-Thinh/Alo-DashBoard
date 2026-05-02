'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'user' | 'admin' | 'super_admin' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  canManageRoles: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  canManageRoles: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) return 'user';
      return (data?.role as UserRole) || 'user';
    } catch {
      return 'user';
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange is the single source of truth.
    // It fires IMMEDIATELY with the current session on mount,
    // so we don't need a separate initializeAuth() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          // Fetch role in background – don't block loading
          fetchUserRole(session.user.id).then(r => {
            if (mounted) setRole(r);
          });
        } else {
          setUser(null);
          setRole(null);
          // Only redirect if we're not already on a public page
          if (
            pathnameRef.current !== '/login' &&
            !pathnameRef.current.startsWith('/auth/')
          ) {
            router.push('/login');
          }
        }

        // Mark loading done after first event regardless of outcome
        if (mounted) setLoading(false);
      }
    );

    // Safety net: if onAuthStateChange never fires (offline/error), unblock UI
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
    // fetchUserRole is stable (useCallback with no deps); router is stable from Next.js
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // signOut: call Supabase only.
  // onAuthStateChange will fire with session=null → setUser(null) → redirect to /login.
  // Do NOT push /login here — login page may still read stale user state
  // and redirect back to /, causing an infinite loop.
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, canManageRoles: role === 'super_admin', signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
