import { cookies } from 'next/headers';
import { GroupedContacts, GroupedConversations, GroupedMessages } from '../types';

const getContacts = async () => {
  const cookie = cookies().get('connect.sid');
  if (!cookie) return null;

  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/contacts`;
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${cookie.name}=${cookie.value}`
    }
  };

  try {
    const res = await fetch(url, options);
    const { contacts } = await res.json();

    return contacts as GroupedContacts | null;
  } catch (error: any) {
    return null;
  }
};

export default getContacts;
