import Sidebar from '@/app/components/sidebar/Sidebar';
import React from 'react';
import { SocketProvider } from '../provider/SocketProvider';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      <SocketProvider>{children}</SocketProvider>
    </Sidebar>
  );
}
