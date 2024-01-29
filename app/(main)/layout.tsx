import Sidebar from '@/app/components/sidebar/Sidebar';
import React from 'react';
import { SocketProvider } from '../provider/SocketProvider';

import { QueryProvider } from '@/app/provider/QueryProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import getConversations from '../actions/getConversations';
import MessagingProvider from '../provider/MessagingProvider';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  const fetchData = async () => {
    const data = await getConversations();

    data?.allConversationsMessages.forEach(async (conversationMessages) => {
      const count = conversationMessages.messages.length;
      await queryClient.setQueryData(['messages', conversationMessages.conversationId], {
        pages: [
          {
            items: conversationMessages.messages,
            nextPage: count
          }
        ],
        pageParams: count,
        unseenMessagesCount: conversationMessages.unseenMessagesCount
      });
    });

    return data?.conversations || { conversations: [] };
  };

  await queryClient.prefetchQuery({
    queryKey: ['conversations'],
    queryFn: fetchData
  });

  return (
    <QueryProvider>
      <SocketProvider>
        <MessagingProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Sidebar>
              {children}
              <ReactQueryDevtools buttonPosition="bottom-left" />
            </Sidebar>
          </HydrationBoundary>
        </MessagingProvider>
      </SocketProvider>
    </QueryProvider>
  );
}
