'use client';

import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import getSession from '../actions/getSession';
import { User } from '../types/index';

interface AuthContextType {
  session: { userId: string; email: string; isVerified: boolean } | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => setSession(await getSession()))();
  }, [router, pathname]);

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
