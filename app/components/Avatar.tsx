'use client';

import React from 'react';
import { User } from '../types/User';
import Image from 'next/image';

interface AvatarProps {
  user?: User;
}

const Avatar: React.FC<AvatarProps> = ({ user }) => {
  return (
    <div className="relative">
      <div
        className="
                relative
                inline-block
                rounded-full
                overflow-hidden
                h-9
                w-9
                md:h-11
                md:w-11"
      >
        <Image alt="Avatar" src={user?.Image || '/images/default_pfp.png'} fill />
      </div>
      <span
        className="
        absolute
        block
        rounded-full
        bg-green-500
        ring-2
        ring-white
        top-0
        right-0
        h-2
        w-2
        md:h-3
        md:w-3
      "
      />
    </div>
  );
};

export default Avatar;
