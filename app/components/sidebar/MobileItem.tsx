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
    <li className="flex flex-col w-full">
      {active && <div className="border-t-2 border-green-500" />}
      <Link
        onClick={handleClick}
        href={href}
        className={clsx(
          `
          flex
          justify-center
          rounded-md
          text-lg
          leading-6
          font-semibold
          p-4
        text-gray-400
        hover:bg-neutral-700
     `,
          active && 'text-green-500'
        )}
      >
        <Icon />
      </Link>
    </li>
  );
};

export default MobileItem;
