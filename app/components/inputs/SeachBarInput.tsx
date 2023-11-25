'use client';

import clsx from 'clsx';
import {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  RefObject,
  useState
} from 'react';
import { HiOutlineArrowRight, HiSearch } from 'react-icons/hi';

interface SearchBarInputProps {
  inputRef?: RefObject<any>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

type Variant = 'SEARCH' | 'RIGHTARROW';

const SearchBarInput: React.FC<SearchBarInputProps> = ({
  type,
  placeholder,
  disabled,
  onChange,
  inputRef
}) => {
  const [variant, setVariant] = useState<Variant>('SEARCH');

  const onClickIconButton: MouseEventHandler<HTMLButtonElement> = async (e) => {
    if (variant === 'SEARCH') {
      inputRef?.current?.focus();
      setVariant('RIGHTARROW');
      return;
    }

    if (variant === 'RIGHTARROW') {
      inputRef?.current?.blur();
      setVariant('SEARCH');
    }
  };

  const onClickInput: MouseEventHandler<HTMLInputElement> = async (e) => {
    if (!e.relatedTarget) setVariant('RIGHTARROW');
  };

  const onBlurInput: FocusEventHandler<HTMLInputElement> = async (e) => {
    if (!e.relatedTarget) setVariant('SEARCH');
  };

  return (
    <div className="flex justify-center items-center">
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onClick={onClickInput}
        onBlur={onBlurInput}
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
        type="button"
        onClick={onClickIconButton}
        className="rounded-r py-2 px-4 h-10 align-middle bg-gray-100 hover:bg-gray-200"
      >
        {variant === 'SEARCH' && <HiSearch />}
        {variant === 'RIGHTARROW' && <HiOutlineArrowRight />}
      </button>
    </div>
  );
};

export default SearchBarInput;
