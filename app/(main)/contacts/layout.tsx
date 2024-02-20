import React from 'react';
import Main from './comonents/Main';

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <Main />
      {children}
    </div>
  );
}
