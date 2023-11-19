import { cookies } from 'next/headers';

const getContacts = async () => {
  try {
    const cookie = cookies().get('connect.sid');
    if (!cookie) return [];

    const url = 'http://localhost:5000/user/contacts';
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${cookie.name}=${cookie.value}`
      }
    };

    const res = await fetch(url, config);
    const { users } = await res.json();

    return users;
  } catch (error) {
    return [];
  }
};

export default getContacts;
