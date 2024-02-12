import { Session } from '@/types';

const getSession = async () => {
  const url = 'http://localhost:5000/auth/session';
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };

  try {
    const res = await fetch(url, options);

    return (await res.json()) as Session;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getSession;
