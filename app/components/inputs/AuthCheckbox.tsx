import clsx from 'clsx';
import React from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';

interface AuthSocialCheckboxProps {
  id: string;
  disabled?: boolean;
  onClick?: () => void;
  register: UseFormRegister<FieldValues>;
}

const Checkbox: React.FC<AuthSocialCheckboxProps> = ({
  id,
  disabled,
  onClick,
  register
}) => {
  return (
    <input
      type="checkbox"
      disabled={disabled}
      onClick={onClick}
      {...register(id)}
      className={clsx(`
        rounded
        w-4 h-4 
        border-gray-300 
        form-checkbox 
        cursor-pointer
        focus:ring 
        focus:ring-indigo-200 
        focus:ring-opacity-50`)}
    />
  );
};

export default Checkbox;
