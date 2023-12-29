import Sidebar from '@/app/components/sidebar/Sidebar';
import React from 'react';
import ConversationList from './components/ConversationList';
import getConversations from '@/app/actions/getConversations';
import { SocketProvider } from '@/app/provider/SocketProvider';

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
