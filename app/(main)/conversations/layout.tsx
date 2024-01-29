import React from 'react';
import ConversationList from './components/ConversationList';

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <ConversationList />
      {children}
    </div>
  );
}
