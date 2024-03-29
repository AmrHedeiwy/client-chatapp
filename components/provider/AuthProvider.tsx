'use client';

import { createContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import getSession from '@/actions/getSession';
import { Session } from '@/types';

export const AuthContext = createContext<{
  data: Session | null;
  setSession: Dispatch<SetStateAction<Session | null>>;
} | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => setSession(await getSession()))();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ data: session, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
