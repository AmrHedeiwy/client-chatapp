'use client';

import React, { createContext, useEffect } from 'react';
import { Conversation, Message, User } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import useConversationParams from '@/hooks/useConversationParams';
import { useRouter } from 'next/navigation';

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
  const { conversationId: activeConversationId } = useConversationParams();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;
    // A user(sender) sent a message to the current user
    socket.on('new_message', (newMessage: Message, pageMessagesLength: number) => {
      const deliverAt = Date.now();

      queryClient.setQueryData(
        ['messages', newMessage.conversationId],
        (prevData: any) => {
          if (!prevData || !prevData.pages || prevData.pages.length === 0) {
            return {
              pages: [
                {
                  items: [newMessage]
                }
              ],
              unseenMessageCount:
                activeConversationId !== newMessage.conversationId ? 1 : 0
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

    // The user(sender) sent a message to another user and it was delivered to them
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

    // The messages that the current user did not recieve
    socket.on('undelivered_messages', (data: Conversation[]) => {
      const deliverAt = Date.now();

      for (const conversation of data) {
        queryClient.setQueryData(
          ['messages', conversation.conversationId],
          (prevData: any) => {
            if (!prevData || !prevData.pages || prevData.pages.length === 0) {
              return {
                pages: [
                  {
                    items: conversation.messages
                  }
                ],
                unseenMessagesCount:
                  activeConversationId !== conversation.conversationId
                    ? conversation.messages.length
                    : 0
              };
            }

            const newData = [...prevData.pages];

            newData[0] = {
              ...newData[0],
              nextPage: newData[0].nextPage + conversation.messages.length,
              items: [...conversation.messages, ...newData[0].items]
            };

            return {
              ...prevData,
              pages: newData,
              unseenMessagesCount:
                activeConversationId !== conversation.conversationId
                  ? prevData.unseenMessagesCount + conversation.messages.length
                  : 0
            };
          }
        );

        socket.emit('update_status', {
          type: 'deliver',
          messages: conversation.messages,
          deliverAt
        });

        if (conversation.conversationId === activeConversationId) {
          socket.emit('update_status', {
            type: 'seen',
            messages: conversation.messages,
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
        content: string;
        updatedAt: string;
      }) => {
        queryClient.setQueryData(['messages', data.conversationId], (prevData: any) => {
          const newData = prevData.pages.map((page: any) => {
            return {
              ...page,
              items: page.items.map((item: any) => {
                if (item.messageId === data.messageId) {
                  return {
                    ...item,
                    content: data.content,
                    updatedAt: data.updatedAt
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
        console.log(data);
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

      const unseenMessagesCount = data.unseenMessagesCount;
      if (unseenMessagesCount > 0 && socket) {
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
    };
  }, [socket, activeConversationId]);

  return (
    <MessagingContext.Provider value={undefined}>{children}</MessagingContext.Provider>
  );
};

export default MessagingProvider;
