import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast as t } from 'react-toastify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toast = (
  type: 'success' | 'error' | 'info',
  message: string,
  time?: number
) => {
  t[type](message, {
    position: 'top-right',
    autoClose: time ?? 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: 'bg-white dark:bg-zinc-800 dark:text-white'
  });
};
