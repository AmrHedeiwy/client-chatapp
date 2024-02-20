import { toast } from '@/lib/utils';

const signOut = async () => {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/sign-out`;
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };

  await fetch(url, options)
    .then(async (res) => {
      const data = await res.json();
      location.replace(data.redirect);
    })
    .catch((e: any) => {
      toast(
        'error',
        'Oops, something went wrong. Please try again later or contact support if the problem persists.'
      );
    });
};

export default signOut;
