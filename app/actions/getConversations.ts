import { cookies } from 'next/headers';
import { Conversation, Message } from '../types';

type ConversationMessages = {
  conversationId: string;
  messages: Message[];
  unseenMessagesCount: number;
};

const getConversations = async () => {
  const cookie = cookies().get('connect.sid');
  if (!cookie) return null;

  const url = 'http://localhost:5000/conversations/fetchAll';
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${cookie.name}=${cookie.value}`
    }
  };

  try {
    const res = await fetch(url, config);
    const { conversations = [], allConversationsMessages = [] } = await res.json();

    return {
      conversations: conversations as Conversation[],
      allConversationsMessages: allConversationsMessages as ConversationMessages[]
    };
  } catch (error: any) {
    return { conversations: [], allConversationsMessages: [] };
  }
};

export default getConversations;
