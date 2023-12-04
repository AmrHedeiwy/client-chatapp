'use client';
import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset' | undefined;
  fullwidth?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  type,
  fullwidth,
  children,
  onClick,
  secondary,
  danger,
  disabled
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        `
        flex
        justify-center
        px-6 
        py-3
        rounded-xl 
        font-semibold
        text-sm
        select-none
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2`,
        disabled && 'opacity-50 cursor-default',
        fullwidth && 'w-full',
        secondary ? 'text-gray-900' : 'text-white',
        danger && 'bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600',
        !secondary &&
          !danger &&
          'bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600'
      )}
    >
      {disabled ? (
        <div className="flex items-center space-x-2">
          <span className="loading loading-spinner"></span>
          <p>loading...</p>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
