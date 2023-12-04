'use client';

import React from 'react';
import { User } from '../types/User';
import clsx from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  user?: User;
  withStatus?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ user, withStatus }) => {
  return (
    <div className="avatar">
      <div
        className={clsx(
          `
          w-12 
          rounded-full 
          `,
          withStatus && 'ring ring-green-400 ring-offset-base-100 ring-offset-2'
        )}
      >
        <Image alt="Avatar" src={user?.Image || '/images/default_pfp.png'} fill />
      </div>
    </div>
  );
};

export default Avatar;
