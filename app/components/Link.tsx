'use client';

import clsx from 'clsx';
import React, { ReactElement } from 'react';

interface LinkProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  withButton?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Link: React.FC<LinkProps> = ({ onClick, disabled, children, withButton, type }) => {
  if (withButton) {
    return (
      <button
        type={type}
        className={clsx(
          `
        flex 
        flex-row 
        items-center 
        border-none
        my-4 
        text-xs
        hover:text-blue-600
        bg-transparent 
        p-0`,
          disabled ? 'text-blue-300 cursor-default' : ' text-blue-500 cursor-pointer'
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
      type={type}
      className={clsx(
        `
        text-sm
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
