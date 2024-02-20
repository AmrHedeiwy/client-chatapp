import { cookies } from 'next/headers';

const getCurrentUserProfile = async () => {
  try {
    const cookie = cookies().get('connect.sid');
    if (!cookie) return null;

    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/users/current`;
    const options: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${cookie.name}=${cookie.value}`
      }
    };

    const res = await fetch(url, options);
    const { curentUser } = await res.json();

    return curentUser || null;
  } catch (error: any) {
    return null;
  }
};

export default getCurrentUserProfile;
