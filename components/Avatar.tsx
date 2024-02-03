'use client';

import React from 'react';
import { User } from '@/app/types/index';
import clsx from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  user?: User | null;
  withStatus?: boolean;
  current?: boolean;
  customSize?: string;
  isOnline?: boolean;
}

const UserAvatar: React.FC<AvatarProps> = ({
  user,
  withStatus,
  current,
  customSize,
  isOnline
}) => {
  return (
    <div className="relative">
      <div
        className={clsx(
          `
          relative
          inline-block
          rounded-full
          overflow-hidden
          `,
          customSize ? customSize : 'h-12 w-12',
          current && 'ring ring-white',
          !user?.image && 'bg-white'
        )}
      >
        {user && (
          <Image
            alt="Avatar"
            src={user?.image || '/images/default_pfp.png'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            blurDataURL="/images/default_pfp.png"
            placeholder="blur"
          />
        )}
      </div>
      {user && withStatus && (
        <span
          className={clsx(
            `
            absolute 
            block 
            rounded-full 
            ring-2 
            ring-white 
            bottom-2 
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

export default UserAvatar;
