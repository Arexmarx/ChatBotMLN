"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { fetchSupabaseSession, signInWithGoogle, signOutUser, subscribeToAuthChanges } from "@/app/api/authApi";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const initialise = async () => {
      try {
        const { data } = await fetchSupabaseSession();
        if (!mounted) {
          return;
        }
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Unable to initialise Supabase auth session", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialise();

    try {
      unsubscribe = subscribeToAuthChanges((_event, nextSession) => {
        if (!mounted) {
          return;
        }
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
      });
    } catch (error) {
      console.error("Unable to subscribe to Supabase auth changes", error);
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/authenticated` : undefined;
    const { error } = await signInWithGoogle(redirectTo);
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await signOutUser();
    if (error) {
      throw error;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, loading, login, loginWithGoogle, logout }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
