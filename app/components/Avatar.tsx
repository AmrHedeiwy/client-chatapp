'use client';

import React from 'react';
import { User } from '../types/index';
import clsx from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  user?: User;
  withStatus?: boolean;
  customSize?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, withStatus, customSize }) => {
  return (
    <div className="avatar">
      <div
        className={clsx(
          `
          relative
          inline-block
          rounded-full
          overflow-hidden
         `,
          withStatus && 'ring ring-green-400',
          customSize ? customSize : 'h-12 w-12',
          !user && 'skeleton shrink-0'
        )}
      >
        {user && (
          <Image alt="Avatar" src={user?.Image || '/images/default_pfp.png'} fill />
        )}
      </div>
    </div>
  );
};

export default Avatar;
