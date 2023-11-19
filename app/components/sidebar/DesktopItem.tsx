'use client';

import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import { RxDividerVertical } from 'react-icons/rx';

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
          flex
          gap-x-3
          rounded-md
          p-4
          text-sm
          leading-6
          font-semibold
          text-gray-500
          hover:bg-neutral-700
          `,
          active && ' text-green-600 '
        )}
      >
        <Icon className="h-7 w-7 shrink-0" />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
};

export default DesktopItem;
