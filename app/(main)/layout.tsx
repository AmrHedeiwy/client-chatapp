import Sidebar from '@/app/components/sidebar/Sidebar';
import React from 'react';
import { SocketProvider } from '../provider/SocketProvider';

import { QueryProvider } from '@/app/provider/QueryProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import getConversations from '../actions/getConversations';
import MessagingProvider from '../provider/MessagingProvider';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import MainProvider from '../provider/MainProvider';
import getCurrentUserProfile from '../actions/getCurrentUserProfile';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  const data = await getConversations();
  const currentUserProfile = await getCurrentUserProfile();

  if (data && data.groupedMessages) {
    Object.entries(data.groupedMessages).forEach(async (groupedMessage) => {
      const count = groupedMessage[1].messages.length;

      await queryClient.setQueryData(['messages', groupedMessage[0]], {
        pages: [
          {
            items: groupedMessage[1].messages,
            nextPage: count
          }
        ],
        pageParams: [count],
        unseenMessagesCount: groupedMessage[1].unseenMessagesCount
      });
    });
  }
  return (
    <QueryProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SocketProvider>
          <MessagingProvider>
            <MainProvider
              currentUserProfile={currentUserProfile}
              intialConversations={data?.conversations || null}
            >
              <Sidebar>
                {children}
                <ReactQueryDevtools buttonPosition="bottom-left" />
              </Sidebar>
            </MainProvider>
          </MessagingProvider>
        </SocketProvider>
      </HydrationBoundary>
    </QueryProvider>
  );
}
