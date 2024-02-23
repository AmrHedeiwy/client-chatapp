import { toast } from '@/lib/utils';
import axios, { AxiosRequestConfig } from 'axios';

const createFakeAccount = async () => {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/createFakeAccount`;
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  };

  try {
    const res = await axios.post(url, {}, config);

    toast('success', res.data.message);

    if (res.data.redirect) location.href = res.data.redirect;
  } catch (e: any) {
    const error = e.response.data.error;

    toast('error', error.message);

    if (error.redirect) location.replace(error.redirect);
  }
};

export default createFakeAccount;
