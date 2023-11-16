'use client';

import clsx from 'clsx';
import React, { ReactElement } from 'react';

interface LinkProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  withButton?: boolean;
}

const Link: React.FC<LinkProps> = ({ onClick, disabled, children, withButton }) => {
  if (withButton) {
    return (
      <button
        type="button"
        className={clsx(
          `
        flex 
        flex-row 
        items-center 
        border-none 
        bg-transparent 
        p-0`,
          disabled ? 'text-blue-300 cursor-default' : ' text-blue-600 cursor-pointer'
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      type="button"
      className={clsx(
        `
        text-base
        select-none
        `,
        disabled ? 'text-blue-300 cursor-default' : ' text-blue-600 cursor-pointer'
      )}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

export default Link;
