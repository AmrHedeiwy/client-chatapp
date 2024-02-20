'use client';

import React, { createContext, useEffect } from 'react';
import { Conversation, Message } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import useConversationParams from '@/hooks/useConversationParams';
import { useRouter } from 'next/navigation';
import { useMain } from '@/hooks/useMain';
import { toast } from '@/lib/utils';

type StatusMessageResponse = {
  conversationId: string;
  messageId: string;
  type: 'deliver' | 'seen';
  deliverAt?: string;
  seenAt?: string;
};

export const MessagingContext = createContext(undefined);

const MessagingProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const router = useRouter();
  const { conversationId: activeConversationId } = useConversationParams();
  const { userProfile, conversations, dispatchConversations } = useMain();

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', async (newMessage: Message) => {
      const deliverAt = Date.now();

      if (!!conversations && !!conversations[newMessage.conversationId]) {
        dispatchConversations({
          type: 'move',
          payload: { moveInfo: { conversationId: newMessage.conversationId } }
        });
      } else {
        try {
          const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/${newMessage.conversationId}`;
          const options: RequestInit = {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          };

          const res = await fetch(url, options);
          const data = await res.json();

          dispatchConversations({
            type: 'add',
            payload: { addInfo: { conversation: data.conversation, initMessages: false } }
          });
        } catch (e: any) {
          const error = e.response.data.error;

          toast('error', error.message);

          if (error.redirect) router.push(error.redirect);
        }
      }

      queryClient.setQueryData(
        ['messages', newMessage.conversationId],
        (prevData: any) => {
          if (!prevData || !prevData.pages || prevData.pages.length === 0) {
            return {
              pages: [
                {
                  items: [newMessage],
                  nextPage: 1
                }
              ],
              unseenMessagesCount:
                activeConversationId !== newMessage.conversationId ? 1 : 0,
              pageParams: 0
            };
          }

          const newData = [...prevData.pages];

          // Add the new message
          newData[0] = {
            ...newData[0],
            items: [newMessage, ...newData[0].items],
            nextPage: newData[0].nextPage + 1
          };

          return {
            ...prevData,
            pages: newData,
            unseenMessagesCount:
              activeConversationId !== newMessage.conversationId
                ? prevData.unseenMessagesCount + 1
                : 0
          };
        }
      );

      socket.emit('update_status', {
        type: 'deliver',
        senderId: newMessage.sender.userId,
        conversationId: newMessage.conversationId,
        messageId: newMessage.messageId,
        deliverAt: deliverAt
      });

      if (activeConversationId === newMessage.conversationId) {
        socket.emit('update_status', {
          type: 'seen',
          senderId: newMessage.sender.userId,
          conversationId: newMessage.conversationId,
          messageId: newMessage.messageId,
          seenAt: deliverAt // The message was seen the same time it was delivered
        });
      }
    });

    socket.on('set_status', (data: StatusMessageResponse, userId: string) => {
      queryClient.setQueryData(['messages', data.conversationId], (prevData: any) => {
        const newData = prevData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: any) => {
              if (item.messageId === data.messageId) {
                return {
                  ...item,
                  ...(data.type === 'deliver'
                    ? { deliverCount: item.deliverCount + 1 }
                    : { seenCount: item.seenCount + 1 }),
                  status: {
                    ...item.status,
                    [userId]: {
                      ...item.status[userId],
                      ...(data.type === 'deliver'
                        ? { deliverAt: data.deliverAt }
                        : { seenAt: data.seenAt })
                    }
                  }
                };
              }
              return item;
            })
          };
        });

        return {
          ...prevData,
          pages: newData
        };
      });
    });

    socket.on('undelivered_messages', (data: Conversation[]) => {
      const deliverAt = Date.now();

      for (const conversation of data) {
        const messages = conversation.messages ?? [];

        queryClient.setQueryData(
          ['messages', conversation.conversationId],
          (prevData: any) => {
            if (!prevData || !prevData.pages || prevData.pages.length === 0) {
              return {
                pages: [
                  {
                    items: messages,
                    nextPage: messages.length
                  }
                ],
                unseenMessagesCount:
                  activeConversationId !== conversation.conversationId
                    ? messages.length
                    : 0,
                pageParams: 0
              };
            }

            const newData = [...prevData.pages];

            newData[0] = {
              ...newData[0],
              nextPage: newData[0].nextPage + messages.length,
              items: [...messages, ...newData[0].items]
            };

            return {
              ...prevData,
              pages: newData,
              unseenMessagesCount:
                activeConversationId !== conversation.conversationId
                  ? prevData.unseenMessagesCount + messages.length
                  : 0
            };
          }
        );

        socket.emit('update_status', {
          type: 'deliver',
          messages: messages,
          deliverAt
        });

        if (conversation.conversationId === activeConversationId) {
          socket.emit('update_status', {
            type: 'seen',
            messages: messages,
            seenAt: deliverAt // message was seen at the same time it was delivered
          });
        }
      }
    });

    socket.on(
      'update_message',
      (data: {
        messageId: string;
        conversationId: string;
        content?: string;
        fileUpload?: string;
        updatedAt?: string;
      }) => {
        queryClient.setQueryData(['messages', data.conversationId], (prevData: any) => {
          const newData = prevData.pages.map((page: any) => {
            return {
              ...page,
              items: page.items.map((item: any) => {
                if (item.messageId === data.messageId) {
                  return {
                    ...item,
                    ...(!!data.fileUpload
                      ? { image: data.fileUpload } // This means the image was successfully saved to the cloud, it does not mean the message was updated. Image messages can not be updated by the user, only text messages
                      : {
                          content: data.content,
                          updatedAt: data.updatedAt
                        })
                  };
                }
                return item;
              })
            };
          });

          return {
            ...prevData,
            pages: newData
          };
        });
      }
    );

    socket.on(
      'remove_message',
      (data: { messageId: string; conversationId: string; deletedAt: string }) => {
        queryClient.setQueryData(['messages', data.conversationId], (prevData: any) => {
          const newData = prevData.pages.map((page: any) => {
            return {
              ...page,
              items: page.items.map((item: any) => {
                if (item.messageId === data.messageId) {
                  return {
                    ...item,
                    content: 'This message was deleted',
                    deletedAt: data.deletedAt
                  };
                }
                return item;
              })
            };
          });

          return {
            ...prevData,
            pages: newData
          };
        });
      }
    );

    if (!!activeConversationId) {
      const data = queryClient.getQueryData(['messages', activeConversationId]) as any;
      if (!data) return;

      const unseenMessagesCount = data.unseenMessagesCount;
      if (unseenMessagesCount > 0 && !!socket) {
        const messages = data.pages[0].items;

        socket.emit('update_status', {
          type: 'seen',
          messages: messages.slice(0, unseenMessagesCount),
          seenAt: Date.now()
        });

        queryClient.setQueryData(['messages', activeConversationId], (prevData: any) => {
          return {
            ...prevData,
            unseenMessagesCount: 0
          };
        });
      }
    }

    return () => {
      socket?.off('new_message');
      socket?.off('set_status');
      socket?.off('undelivered_messages');
      socket?.off('update_message');
      socket?.off('remove_message');
    };
  }, [
    socket,
    activeConversationId,
    conversations,
    dispatchConversations,
    queryClient,
    userProfile,
    router
  ]);

  return (
    <MessagingContext.Provider value={undefined}>{children}</MessagingContext.Provider>
  );
};

export default MessagingProvider;
