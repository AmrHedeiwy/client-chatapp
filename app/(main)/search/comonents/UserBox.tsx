'use client';

import Avatar from '@/app/components/Avatar';
import { User } from '@/app/types/User';
import React, { FormEventHandler, useState } from 'react';
import clsx from 'clsx';
import { BsChatDots, BsInfoCircle, BsPersonAdd, BsPersonFillCheck } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notify } from '@/app/utils/notifications';
import { ErrorProps, ResponseProps } from '@/app/types/Axios';

interface UserBoxProps {
  data: User;
  isActive: boolean;
  onInput: FormEventHandler<HTMLInputElement>;
}

const UserBox: React.FC<UserBoxProps> = ({ data, isActive, onInput }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen((val) => !val);

  return (
    <div
      className={clsx(
        `
        w-full
        relative
        collapse
        rounded-lg
        cursor-default
        select-none
        transition
        hover:border
        hover:p-1
        hover:bg-slate-100
        focus-within:bg-slate-100`,
        isActive && 'collapse-open',
        !isActive && 'collapse-close'
      )}
    >
      <input type="checkbox" onInput={onInput} />

      <div className="flex items-center space-x-3 collapse-title">
        <Avatar user={data} />
        <p className="text-sm font-medium text-gray-900">{data.Username}</p>
      </div>
    </div>
  );
};

export default UserBox;
