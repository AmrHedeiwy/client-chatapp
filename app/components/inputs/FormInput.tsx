'use client';

import clsx from 'clsx';
import { FieldError, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

interface InputProps {
  id: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
}

const FormInput: React.FC<InputProps> = ({
  id,
  type,
  placeholder,
  required,
  register,
  errors,
  disabled
}) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(id, { required })}
        className={clsx(
          `
          w-full 
          py-3 
          px-6 
          ring-1 
          rounded-xl
          outline-none
          text-black 
          placeholder-gray-600 
          bg-transparent 
          transition`,
          errors[id] && 'ring-rose-500',
          disabled && 'opacity-50 cursor-default'
        )}
      />
      {errors[id] && (
        <div className="text-red-500 ml-1 mt-1">
          <span>{(errors[id] as FieldError).message}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
