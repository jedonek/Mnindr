import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '@/lib/api';
import type { ProfileUpdate } from '@/lib/api';
import type { RegisterBasics, RegisterPetInfo, SessionUser } from '@/types';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (basics: RegisterBasics, pet: RegisterPetInfo) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: ProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getCurrentUser().then((u) => {
      if (active) {
        setUser(u);
        setLoading(false);
      }
    }).catch(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await api.login(email, password));
  }, []);

  const register = useCallback(async (basics: RegisterBasics, pet: RegisterPetInfo) => {
    setUser(await api.register(basics, pet));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (patch: ProfileUpdate) => {
    setUser(await api.updateProfile(patch));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musí být použit uvnitř <AuthProvider>.');
  return ctx;
}
