import React from 'react';
import ConversationList from './components/ConversationList';
import getConversations from '@/app/actions/getConversations';

export default async function ConversationsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();

  return (
    <div className="h-full">
      <ConversationList intialItems={conversations} />
      {children}
    </div>
  );
}
