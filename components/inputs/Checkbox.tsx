import clsx from 'clsx';
import React from 'react';
import { FieldError, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

interface AuthSocialCheckboxProps {
  id: string;
  disabled?: boolean;
  onClick?: () => void;
  register: UseFormRegister<FieldValues>;
  errors?: FieldErrors;
  children?: React.ReactNode;
}

const Checkbox: React.FC<AuthSocialCheckboxProps> = ({
  id,
  disabled,
  onClick,
  register,
  errors,
  children
}) => {
  return (
    <div>
      <input
        type="checkbox"
        disabled={disabled}
        onClick={onClick}
        {...register(id)}
        className={clsx(`
        rounded
        w-4 
        h-4 
        border-gray-300 
        form-checkbox 
        cursor-pointer
        focus:ring 
        focus:ring-indigo-200 
        focus:ring-opacity-50`)}
      />
      <span className="ml-2">{children}</span>
      <div className="text-red-500 text-sm">
        {errors && errors[id] && <span>{(errors[id] as FieldError).message}</span>}
      </div>
    </div>
  );
};

export default Checkbox;
