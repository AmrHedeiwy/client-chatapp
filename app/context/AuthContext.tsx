'use client';

import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export interface User {
  UserID: string;
  GoogleID: string | null;
  FacebookID: string | null;
  Username: string;
  Email: string;
  Image: string | null;
  IsVerified: boolean;
  LastVerifiedAt: Date | null;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchSession = async () => {
  try {
    const response = await axios.get('http://localhost:5000/auth/info/session', {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    return response.data.user;
  } catch (error) {
    console.error(error);
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => setUser(await fetchSession()))();
  }, [router]);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useSession = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession() must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
