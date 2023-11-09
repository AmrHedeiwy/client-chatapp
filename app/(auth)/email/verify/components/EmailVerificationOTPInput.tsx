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
    <div className="w-16 h-16">
      <input
        type="number"
        value={value}
        ref={inputRef}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={clsx(
          `
          w-full
          h-full
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-5
          outline-none
          rounded-xl
          border
          text-lg
          bg-white
          focus:ring-1 
          spin-button-none`,
          errors[index] && 'border-rose-500',
          !errors[index] && 'ring-blue-700'
        )}
      />
    </div>
  );
};

export default OTPInput;
