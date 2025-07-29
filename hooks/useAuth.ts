
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: { fullName: string; companyName: string }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      // Create profile after successful signup
      if (data.user && userData) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            full_name: userData.fullName,
            email: email,
            phone: '',
            company_name: userData.companyName,
            website: '',
            address: '',
            bank_account: '',
            bio: '',
            income_categories: ['DP Proyek', 'Pelunasan Proyek', 'Penjualan Album', 'Sewa Alat', 'Lain-lain'],
            expense_categories: ['Gaji Freelancer', 'Hadiah Freelancer', 'Penarikan Hadiah Freelancer', 'Sewa Tempat', 'Transportasi', 'Konsumsi', 'Marketing', 'Sewa Alat', 'Cetak Album', 'Operasional Kantor', 'Transfer Antar Kantong', 'Penutupan Anggaran'],
            project_types: ['Pernikahan', 'Pre-wedding', 'Lamaran', 'Acara Korporat', 'Ulang Tahun'],
            event_types: ['Meeting Klien', 'Survey Lokasi', 'Libur', 'Workshop', 'Lainnya'],
            notification_settings: { newProject: true, paymentConfirmation: true, deadlineReminder: true },
            security_settings: { twoFactorEnabled: false }
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      console.log('Sign in successful:', data);
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Sign in error:', errorMessage);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Password reset failed' };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!authState.user
  };
};
