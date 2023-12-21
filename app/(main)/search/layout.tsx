import React from 'react';
import Sidebar from '@/app/components/sidebar/Sidebar';
import { QueryProvider } from '@/app/provider/QueryProvider';
import SearchMain from './comonents/SearchMain';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      <QueryProvider>
        <SearchMain />
        <ReactQueryDevtools />
      </QueryProvider>
      <div className="h-full">{children}</div>
    </Sidebar>
  );
}
