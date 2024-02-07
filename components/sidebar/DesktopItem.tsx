'use client';

import Link from 'next/link';
import React from 'react';
import clsx from 'clsx';

interface DesktopItemProps {
  label: string;
  icon: any;
  href: string;
  onClick?: () => void;
  active?: boolean;
}

const DesktopItem: React.FC<DesktopItemProps> = ({
  label,
  icon: Icon,
  href,
  onClick,
  active
}) => {
  const handleClick = () => {
    if (onClick) return onClick();
  };
  return (
    <li onClick={handleClick} className="flex flex-row">
      <Link
        href={href}
        className={clsx(
          `
          rounded-md
          px-6
          py-4
          text-sm
          leading-6
          font-semibold
          text-gray-400
          hover:bg-neutral-100
          dark:hover:bg-neutral-700
          
          `,
          active && ' text-green-500'
        )}
      >
        <Icon className="h-7 w-7 shrink-0 " />
        <span className="sr-only">{label}</span>
      </Link>
      {active && <div className="border-r-2 border-green-500" />}
    </li>
  );
};

export default DesktopItem;
