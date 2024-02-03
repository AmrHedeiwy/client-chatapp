'use client';

import clsx from 'clsx';
import React, { ChangeEvent, KeyboardEvent, RefObject } from 'react';

interface OTPInputProps {
  index: number;
  value: string;
  inputRef: RefObject<HTMLInputElement> | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  errors: boolean[];
}

const OTPInput: React.FC<OTPInputProps> = ({
  index,
  value,
  inputRef,
  onChange,
  onKeyDown,
  errors
}) => {
  return (
    <input
      type="number"
      value={value}
      ref={inputRef}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={clsx(
        `
          w-10
          h-10
          text-center
          outline-none
          rounded-md
          border
          text-base
          text-black
          bg-white
          focus:ring-1 
          spin-button-none`,
        errors[index] && 'border-rose-500',
        !errors[index] && 'ring-blue-700'
      )}
    />
  );
};

export default OTPInput;
