import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notify } from '../utils/notifications';

const signOut = async () => {
  const url = 'http://localhost:5000/auth/sign-out';
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  };

  axios
    .post(url, undefined, config)
    .then((res: AxiosResponse) => window.location.replace(res.data.redirect))
    .catch((e: AxiosError) => {
      console.error(e);
      notify(
        'error',
        "'Oops, something went wrong. Please try again later or contact support if the problem persists.'"
      );
    });
};

export default signOut;
