import { toast } from '@/lib/utils';

const signOut = async () => {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/sign-out`;
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };

  try {
    const res = await fetch(url, options);

    const data = await res.json();
    location.replace(data.redirect);
  } catch (e: any) {
    const error = e.response.data.error;

    toast('error', error.message);

    if (error.redirect) location.replace(error.redirect);
  }
};

export default signOut;
