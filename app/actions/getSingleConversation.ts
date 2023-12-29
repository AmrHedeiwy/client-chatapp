import { cookies } from 'next/headers';

const getSingleConversation = async (conversationId: string) => {
  try {
    const cookie = cookies().get('connect.sid');
    if (!cookie) return null;

    const url = `http://localhost:5000/user/conversation/${conversationId}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${cookie.name}=${cookie.value}`
      }
    };

    const res = await fetch(url, config);
    const { conversation } = await res.json();

    return conversation;
  } catch (error) {
    return null;
  }
};

export default getSingleConversation;
