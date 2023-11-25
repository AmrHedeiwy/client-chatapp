'use client';

import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

interface MobileItemProps {
  href: string;
  icon: any;
  active?: boolean;
  onClick?: () => void;
}

const MobileItem: React.FC<MobileItemProps> = ({ href, icon: Icon, active, onClick }) => {
  const handleClick = () => {
    if (onClick) return onClick();
  };

  return (
    <Link
      onClick={handleClick}
      href={href}
      className={clsx(
        `
        group
        flex
        gap-x-3
        text-lg
        leading-6
        font-semibold
        w-full
        justify-center
        p-4
        text-gray-400
        hover:bg-neutral-700
     `,
        active && 'text-green-500'
      )}
    >
      <Icon />
    </Link>
  );
};

export default MobileItem;
