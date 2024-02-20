import { cookies } from 'next/headers';
import { GroupedConversations, GroupedMessages } from '../types';

const getConversations = async () => {
  const cookie = cookies().get('connect.sid');
  if (!cookie) return null;

  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations`;
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${cookie.name}=${cookie.value}`
    }
  };

  try {
    const res = await fetch(url, options);
    const { conversations, groupedMessages } = await res.json();

    return {
      conversations: conversations as GroupedConversations | null,
      groupedMessages: groupedMessages as GroupedMessages | null
    };
  } catch (error: any) {
    return { conversations: null, groupedMessages: null };
  }
};

export default getConversations;
