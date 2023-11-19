'use client';

import clsx from 'clsx';
import { ChangeEventHandler, MouseEventHandler } from 'react';
import { HiOutlineArrowRight, HiSearch } from 'react-icons/hi';

interface SearchBarInputProps {
  id: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onClick: MouseEventHandler<HTMLButtonElement>;
  variant?: 'SEARCH' | 'RIGHTARROW';
}

const SearchBarInput: React.FC<SearchBarInputProps> = ({
  type,
  placeholder,
  disabled,
  onChange,
  onClick,
  id,
  variant
}) => {
  return (
    <div className="flex justify-center items-center">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        className={clsx(
          ` 
          w-full
          h-10
          py-3 
          px-4 
          rounded-l
          text-black 
          placeholder-gray-600 
          placeholder:text-xs
          placeholder:font-medium
          bg-gray-100
          outline-none
          `,

          disabled && 'opacity-50 cursor-default'
        )}
      />
      <button
        type="submit"
        onClick={onClick}
        className="rounded-r py-2 px-4 h-10 align-middle bg-gray-100 hover:bg-gray-200"
      >
        {variant === 'SEARCH' && <HiSearch />}
        {variant === 'RIGHTARROW' && <HiOutlineArrowRight />}
      </button>
    </div>
  );
};

export default SearchBarInput;
