'use client';

import React, { createContext, useEffect, useReducer, useState } from 'react';
import { Conversation, Message, User } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../hooks/useSocket';
import useConversationParams from '../hooks/useConversationParams';

type StatusMessageResponse = {
  conversationId: string;
  messageId: string;
  pageMessagesLength: number;
  index?: number;
  deliverAt?: string;
  seenAt?: string;
};

export const MessagingContext = createContext(undefined);

const MessagingProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { conversationId: activeConversationId } = useConversationParams();

  useEffect(() => {
    if (!socket) return;
    // A user(sender) sent a message to the current user
    socket.on('deliver_message', (newMessage: Message, pageMessagesLength: number) => {
      const deliverAt = new Date();

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
            nextPage: newData[0].nextPage + 1,
            items: [newMessage, ...newData[0].items]
          };

          return {
            pageParams: prevData.pageParams,
            pages: newData,
            unseenMessagesCount:
              activeConversationId !== newMessage.conversationId
                ? prevData.unseenMessagesCount + 1
                : 0
          };
        }
      );

      socket.emit('acknowledge_message', {
        type: 'single',
        senderId: newMessage.senderId,
        conversationId: newMessage.conversationId,
        messageId: newMessage.messageId,
        pageMessagesLength: pageMessagesLength,
        deliverAt: deliverAt
      });

      if (activeConversationId === newMessage.conversationId) {
        socket.emit('seen_message', {
          type: 'single',
          senderId: newMessage.senderId,
          conversationId: newMessage.conversationId,
          messageId: newMessage.messageId,
          pageMessagesLength: pageMessagesLength,
          seenAt: deliverAt // since the message was seen the same time it was delivered
        });
      }
    });

    // The user(sender) sent a message to another user and it was delivered to them
    socket.on('set_deliver_status', (data: StatusMessageResponse, user: User) => {
      queryClient.setQueryData(['messages', data.conversationId], (prevData: any) => {
        const newData = [...prevData.pages];

        // The number of message in the current page
        const currentPageMessagesLength = newData[0].items.length;

        /**
         * Calculates the message index based on the provided data.
         *
         * The message index can be determined using either of the following methods:
         *
         * 1. index: If the message was sent as a type 'batch'.
         * 2. pageMessagesLength: This represents the number of messages in the page from when the user sent the message, the type is 'single'.
         *
         * The calculation of the message index involves considering the pageMessagesLength:
         * - This calculation applies only when data.index is undefined.
         * - For example, if the sender has 20 messages in the first page and sends a message, resulting in
         *   21 messages in the first page, the pageMessagesLength will be sent with the value 21.
         * - When the message is delivered to the user, they send back the same pageMessagesLength value.
         *   If the currentPageMessagesLength is still 21 (indicating that no messages were sent since the
         *   last message was sent), the message index would be 21 - 21 = 0.
         * - However, if a message were sent before the acknowledgment of the deliver status was sent,
         *   the currentPageMessagesLength would be 22, resulting in the message index being 22 - 21 = 1.
         *   This is correct because the original message that the deliver status pertained to was at index 0
         *   with 21 messages in the page, and now with 22 messages in the page, the message got pushed to index 1.
         */
        const messageIndex =
          data.index !== undefined
            ? data.index
            : currentPageMessagesLength - data.pageMessagesLength;

        if (
          messageIndex >= 0 &&
          newData[0].items[messageIndex].messageId === data.messageId
        ) {
          newData[0].items[messageIndex].deliverStatus = [
            ...prevData.pages[0].items[messageIndex].deliverStatus,
            { user, deliverAt: data.deliverAt }
          ];
        } else {
          /**
           * Indicates an unlikely scenario where the corresponding message is not found.
           *
           * This case is highly improbable and occurs when a user sends a message to another user
           * while the socket is in the process of connecting. However, it is still very unlikely
           * to happen in typical usage scenarios.
           */
          for (let i = data.index || 0; i < newData[0].items.length; i++) {
            if (newData[0].items[i].messageId === data.messageId) {
              newData[0].items[i].deliverStatus = [
                ...prevData.pages[0].items[i].deliverStatus,
                { user, deliverAt: data.deliverAt }
              ];
              break;
            }
          }
        }

        return {
          pageParams: prevData.pageParams,
          pages: newData,
          unseenMessagesCount: prevData.unseenMessagesCount
        };
      });
    });

    // The user's(sender) message was seen by the other user
    socket.on('set_seen_status', (data: StatusMessageResponse, user: User) => {
      queryClient.setQueryData(['messages', data.conversationId], (prevData: any) => {
        const newData = [...prevData.pages];

        const currentPageMessagesLength = newData[0].items.length;

        /**
         * Calculates the message index based on the provided data.
         *
         * The message index can be determined using either of the following methods:
         *
         * 1. index: If the message was sent as a type 'batch'.
         * 2. pageMessagesLength: This represents the number of messages in the page from when the user sent the message, the type is 'single'.
         *
         * The calculation of the message index involves considering the pageMessagesLength:
         * - This calculation applies only when data.index is undefined.
         * - For example, if the sender has 20 messages in the first page and sends a message, resulting in
         *   21 messages in the first page, the pageMessagesLength will be sent with the value 21.
         * - When the message is seen by the user, they send back the same pageMessagesLength value.
         *   If the currentPageMessagesLength is still 21 (indicating that no messages were sent since the
         *   last message was sent), the message index would be 21 - 21 = 0.
         * - However, if a message were sent before the seen status was set,the currentPageMessagesLength would be 22,
         *   resulting in the message index being 22 - 21 = 1.
         *   This is correct because the original message that the seen status pertained to was at index 0
         *   with 21 messages in the page, and now with 22 messages in the page, the message got pushed to index 1.
         */
        const messageIndex =
          data.index !== undefined
            ? data.index
            : currentPageMessagesLength - data.pageMessagesLength;

        if (
          messageIndex >= 0 &&
          newData[0].items[messageIndex].messageId === data.messageId
        ) {
          newData[0].items[messageIndex].seenStatus = [
            ...prevData.pages[0].items[messageIndex].seenStatus,
            { user, seenAt: data.seenAt }
          ];
        } else {
          // Very unlikely to happen and have not run into this problem yet, still a jic solution
          for (let i = data.index || 0; i < newData[0].items.length; i++) {
            if (newData[0].items[i].messageId === data.messageId) {
              newData[0].items[i].seenStatus = [
                ...prevData.pages[0].items[i].seenStatus,
                { user, seenAt: data.seenAt }
              ];
              break;
            }
          }
        }

        return {
          pageParams: prevData.pageParams,
          pages: newData,
          unseenMessagesCount: prevData.unseenMessagesCount
        };
      });
    });

    // The messages that the current user did not recieve
    socket.on('undelivered_messages', (data: Conversation[]) => {
      const deliverAt = new Date();

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
              nextPage: newData[0].nextPage + conversation.messages.length,
              items: [...conversation.messages, ...newData[0].items]
            };

            return {
              pageParams: prevData.pageParams,
              pages: newData,
              unseenMessagesCount:
                activeConversationId !== conversation.conversationId
                  ? prevData.unseenMessagesCount + conversation.messages.length
                  : 0
            };
          }
        );

        socket.emit('acknowledge_message', {
          type: 'batch',
          messages: conversation.messages,
          deliverAt
        });

        if (conversation.conversationId === activeConversationId) {
          socket.emit('seen_message', {
            type: 'batch',
            messages: conversation.messages,
            seenAt: deliverAt // message was seen at the same time it was delivered
          });
        }
      }
    });

    if (!!activeConversationId) {
      const data = queryClient.getQueryData(['messages', activeConversationId]) as any;

      const unseenMessagesCount = data.unseenMessagesCount;
      if (unseenMessagesCount > 0 && socket) {
        const messages = data.pages[0].items;

        socket.emit('seen_message', {
          type: 'batch',
          messages: messages.slice(0, unseenMessagesCount),
          seenAt: new Date()
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
      socket?.off('deliver_message');
      socket?.off('set_deliver_status');
      socket?.off('set_seen_status');
      socket?.off('undelivered_messages');
    };
  }, [socket, activeConversationId]);

  return (
    <MessagingContext.Provider value={undefined}>{children}</MessagingContext.Provider>
  );
};

export default MessagingProvider;
