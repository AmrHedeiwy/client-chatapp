'use client';

import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
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
    <li onClick={handleClick}>
      <Link
        href={href}
        className={clsx(
          `
          px-6
          py-4
          text-sm
          rounded-md
          leading-6
          font-semibold
          text-gray-400
          hover:bg-neutral-700
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
