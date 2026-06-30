import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Role {
  id: string;
  name: string;
  allowed_modules: string[];
}

interface Profile {
  id: string;
  name: string;
  role_id: string | null;
  sub_role?: string;
  rank?: string;
  role?: Role;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, role:roles(*)')
        .eq('id', userId)
        .single();
      
      if (data) {
        // If there's no role assigned or roles table is empty, provide a fallback
        const profileData = data as any;
        if (!profileData.role) {
           profileData.role = {
             name: 'Адмін',
             allowed_modules: [
               'Планування замірів', 'Заміри (AppSheet)', 'Конструктив', 'Виробництво (MES)',
               'Планування доставок', 'Доставка', 'Планування монтажів', 'Монтажі (AppSheet)',
               'Моніторинг замовлень', 'Графіки роботи', 'Розрахунок ЗП', 'Співробітники', 'Налаштування ролей', 'ШІ Аналітика'
             ]
           };
        }
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Завантаження...</div>;
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
