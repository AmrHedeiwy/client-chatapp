'use client';

import React from 'react';
import { User } from '../types/index';
import clsx from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  user?: User;
  withStatus?: boolean;
  current?: boolean;
  customSize?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, withStatus, current, customSize }) => {
  return (
    <div className="avatar">
      <div
        className={clsx(
          `
          relative
          inline-block
          rounded-full
          overflow-hidden
          bg-white`,
          customSize ? customSize : 'h-12 w-12',
          !user && 'skeleton shrink-0',
          current && 'ring ring-white'
        )}
      >
        {user && (
          <Image alt="Avatar" src={user?.Image || '/images/default_pfp.png'} fill />
        )}
      </div>
      {user && withStatus && (
        <span
          className="
            absolute 
            block 
            rounded-full 
            bg-green-500 
            ring-2 
            ring-white 
            bottom-1 
            right-1
            h-1 
            w-1 
            md:h-2 
            md:w-2
          "
        />
      )}
    </div>
  );
};

export default Avatar;
