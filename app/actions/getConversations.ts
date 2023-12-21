import { cookies } from 'next/headers';
import { Conversation } from '../types';

const getConversations = async () => {
  const cookie = cookies().get('connect.sid');
  if (!cookie) return null;

  const url = 'http://localhost:5000/user/conversations';
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${cookie.name}=${cookie.value}`
    }
  };

  try {
    const res = await fetch(url, config);
    const { conversations } = await res.json();

    return conversations as Conversation[];
  } catch (error: any) {
    return [];
  }
};

export default getConversations;
