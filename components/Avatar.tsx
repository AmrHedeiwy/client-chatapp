'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

interface AvatarProps {
  imageUrl: string | null;
  withStatus?: boolean;
  current?: boolean;
  custom?: string;
  isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  withStatus,
  current,
  custom,
  isOnline
}) => {
  if (imageUrl === 'pending')
    return <Skeleton className={cn('lg:h-14 lg:w-14 w-12 h-12 rounded-full', custom)} />;

  return (
    <div className="relative">
      <div
        className={cn(
          `
            relative
            inline-block
            rounded-full
            overflow-hidden
            lg:h-14 
            lg:w-14 
            w-12 
            h-12`,
          custom,
          current && 'ring ring-white',
          !imageUrl && 'bg-white'
        )}
      >
        <Image
          alt="Avatar"
          src={imageUrl || '/images/default_pfp.png'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          blurDataURL="/images/default_pfp.png"
          placeholder="blur"
        />
      </div>
      {withStatus && (
        <span
          className={cn(
            `
            absolute 
            block 
            rounded-full 
            ring-2 
            ring-white 
            bottom-2.5 
            right-1
            h-2 
            w-2`,
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
