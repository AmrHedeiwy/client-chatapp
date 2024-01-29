import React from 'react';
import SearchMain from './comonents/SearchMain';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SearchMain />
      <div className="h-full">{children}</div>
    </>
  );
}
