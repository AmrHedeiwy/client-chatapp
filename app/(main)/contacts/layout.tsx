import React from 'react';
import ContactMain from './comonents/ContactMain';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContactMain />
      <div className="h-full">{children}</div>
    </>
  );
}
