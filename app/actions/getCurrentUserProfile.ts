import { cookies } from 'next/headers';

const getCurrentUserProfile = async () => {
  try {
    const cookie = cookies().get('connect.sid');
    if (!cookie) return null;

    const url = 'http://localhost:5000/users/current';
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${cookie.name}=${cookie.value}`
      }
    };

    const res = await fetch(url, config);
    const { curentUser } = await res.json();

    return curentUser || null;
  } catch (error: any) {
    return null;
  }
};

export default getCurrentUserProfile;
