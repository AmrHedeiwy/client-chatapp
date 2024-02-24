import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface SocialButtonProps {
  provider: 'facebook' | 'google';
  onClick: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 dark:bg-slate-50 dark:hover:bg-slate-200"
    >
      <div className="flex gap-4 justify-center">
        <Image
          src={`/images/${provider}.png`}
          alt={provider}
          width={provider === 'google' ? 20 : 11}
          height={1}
        />

        <span
          id="google"
          className={cn(
            `flex items-center font-medium text-sm tracking-wider `,
            provider === 'google' && ' text-white dark:text-blue-500',
            provider === 'facebook' && 'text-white dark:text-blue-700'
          )}
        >
          {provider}
        </span>
      </div>
    </button>
  );
};

export default SocialButton;
