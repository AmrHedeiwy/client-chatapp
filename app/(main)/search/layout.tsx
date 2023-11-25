import React from 'react';
import Sidebar from '@/app/components/sidebar/Sidebar';
import { QueryProvider } from '@/app/provider/QueryProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import SearchForm from './comonents/SearchForm';

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      <QueryProvider>
        <SearchForm />
        <ReactQueryDevtools />
      </QueryProvider>
      <div className="h-full">{children}</div>
    </Sidebar>
  );
}
