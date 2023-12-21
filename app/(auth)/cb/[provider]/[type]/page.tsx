'use client';

import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export default function CallBackPage() {
  const { provider, type } = useParams<{
    provider: 'google' | 'facebook';
    type: 'success' | 'error';
  }>();

  useEffect(() => {
    (async () => {
      const res = await fetch(`http://localhost:5000/auth/info/authorisation`, {
        credentials: 'include'
      });

      const { isCallbackProvider } = await res.json();

      console.log(isCallbackProvider);
      // @ts-ignore
      if (!isCallbackProvider) window.close() || window.history.back();

      setTimeout(() => {
        localStorage.setItem(provider, type);
        window.close();
      }, 1000);
    })();
  }, [provider, type]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div
        className={clsx(
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
          className={clsx(
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
