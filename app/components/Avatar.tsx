'use client';

import React from 'react';
import { User } from '../types/User';
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
          customSize ? customSize : 'h-10 w-10 md:h-12 md:w-12'
        )}
      >
        <Image alt="Avatar" src={user?.Image || '/images/default_pfp.png'} fill />
      </div>
    </div>
  );
};

export default Avatar;
