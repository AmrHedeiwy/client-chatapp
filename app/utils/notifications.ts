import { toast } from 'react-toastify';

export const notify = (
  type: 'success' | 'error' | 'info',
  message: string,
  time?: number
) => {
  toast[type](message, {
    position: 'top-right',
    autoClose: time ?? 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  });
};
