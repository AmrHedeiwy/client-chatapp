'use client';

import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  imageUrl: string | null;
  withStatus?: boolean;
  current?: boolean;
  customSize?: string;
  isOnline?: boolean;
}

const UserAvatar: React.FC<AvatarProps> = ({
  imageUrl,
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
          customSize ? customSize : 'lg:h-14 lg:w-14 w-12 h-12',
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
