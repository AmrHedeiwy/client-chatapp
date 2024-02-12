'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { useParams } from 'next/navigation';

export default function CallBackPage() {
  const { provider, type } = useParams<{
    provider: 'google' | 'facebook';
    type: 'success' | 'error';
  }>();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    timer = setTimeout(() => {
      localStorage.setItem(provider, type);
      window.close();

      if (timer) clearInterval(timer);
    }, 1000);
  }, [provider, type]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div
        className={cn(
          `
            flex 
            border 
            rounded-full 
            pr-8`,
          type === 'success' && 'border-green-50 bg-green-100',
          type === 'error' && 'border-rose-50 bg-rose-200'
        )}
      >
        <Image src={`/images/${type}-provider.png`} alt={type} width={100} height={100} />

        <p
          className={cn(
            `
            flex
            items-center
            pl-2
            font-bold`,
            type === 'success' && 'text-green-500',
            type === 'error' && 'text-red-500'
          )}
        >
          {type === 'success' && `Successfully signed in with ${provider}`}
          {type === 'error' && `Trouble signing in with ${provider}.`}
        </p>
      </div>
    </div>
  );
}
