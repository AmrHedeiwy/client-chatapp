import Sidebar from '@/components/sidebar/Sidebar';
import React from 'react';
import { SocketProvider } from '../../components/provider/SocketProvider';

import { QueryProvider } from '@/components/provider/QueryProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import getConversations from '../../actions/getConversations';
import MessagingProvider from '../../components/provider/MessagingProvider';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import MainProvider from '../../components/provider/MainProvider';
import getCurrentUserProfile from '../../actions/getCurrentUserProfile';
import { ModalProvider } from '../../components/provider/ModalProvider';
import getContacts from '../../actions/getContacts';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  const currentUserProfile = await getCurrentUserProfile();

  const groupedData = await getConversations();
  const contacts = await getContacts();

  if (groupedData && groupedData.groupedMessages) {
    Object.entries(groupedData.groupedMessages).forEach(async (groupedMessage) => {
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
              intialConversations={groupedData?.conversations || null}
              intialContacts={contacts}
            >
              <Sidebar>
                <ModalProvider />
                {children}
                {/* <ReactQueryDevtools buttonPosition="top-left" /> */}
              </Sidebar>
            </MainProvider>
          </MessagingProvider>
        </SocketProvider>
      </HydrationBoundary>
    </QueryProvider>
  );
}
