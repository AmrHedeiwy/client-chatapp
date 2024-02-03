import React from 'react';
import ContactMain from './comonents/ContactMain';

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <ContactMain />
      {children}
    </div>
  );
}
