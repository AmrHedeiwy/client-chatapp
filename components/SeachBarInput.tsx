'use client';

import {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  RefObject,
  useState
} from 'react';

import { Search, ArrowRight } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarInputProps {
  inputRef: RefObject<any>;
  placeholder?: string;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

type Variant = 'SEARCH' | 'RIGHTARROW';

const SearchBarInput: React.FC<SearchBarInputProps> = ({
  placeholder,
  disabled,
  onChange,
  inputRef
}) => {
  const [variant, setVariant] = useState<Variant>('SEARCH');

  const onClickIconButton: MouseEventHandler<HTMLButtonElement> = async () => {
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
    <div className="relative ">
      <Input
        id={'search_bar'}
        ref={inputRef}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onClick={onClickInput}
        onBlur={onBlurInput}
        maxLength={37}
        className={cn(
          ` 
            w-full
            block
            h-10
            py-3 
            px-4 
           text-zinc-600 
           dark:text-zinc-100   
           placeholder:font-medium
           placeholder:text-xs
           placeholder:text-zinc-400
           dark:placeholder:text-zinc-300
            bg-zinc-50
            dark:bg-zinc-700
            focus-visible:ring-0
            border-none
            rounded-l
            transition
        `,
          disabled && 'opacity-50 cursor-default'
        )}
      />
      {/* <button
        type="button"
        onClick={onClickIconButton}
        className="rounded-r absolute py-2 px-4 h-10 align-middle  bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800"
      >
       
      </button> */}
      <button
        type="button"
        onClick={onClickIconButton}
        className="absolute bottom-2 right-4"
      >
        {variant === 'SEARCH' && <Search />}
        {variant === 'RIGHTARROW' && <ArrowRight />}
      </button>
    </div>
  );
};

export default SearchBarInput;
