'use client';

import * as y from 'yup';
import { HiPaperAirplane } from 'react-icons/hi2';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import MessageInput from './MessageInput';
import Link from '@/app/components/Link';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSocket } from '@/app/hooks/useSocket';
import { Conversation, Message, User } from '@/app/types';
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useConversationParams from '@/app/hooks/useConversationParams';
import { useMain } from '@/app/hooks/useMain';

const formSchema = y.object({
  Content: y.string().min(1)
});

type FormProps = {
  conversation: Conversation;
};

const Form: React.FC<FormProps> = ({ conversation }) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { conversationId } = useConversationParams();
  const { userProfile, dispatchConversations } = useMain();

  /**
   * Array of user IDs representing the other users in the chat.
   *
   * This array is sent in the socket body when a message is sent,
   * allowing the other users to receive the message.
   */
  const userIds = useMemo<string[]>(() => {
    return (
      !conversation.isGroup
        ? [(conversation.otherUser as User).userId as string]
        : (conversation.otherUsers as User[]).map((user) => user.userId)
    ) as string[];
  }, [conversation]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FieldValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      content: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const messageId = uuidv4();
    const createdAt = new Date();

    // The number of messages in the current page, set as 1 is there were no previous messages
    let pageMessagesLength = 1;

    let newMessage = {
      conversationId,
      messageId,
      createdAt: createdAt.toLocaleString(),
      senderId: socket.id,
      content: data.content,
      seenStatus: [],
      deliverStatus: [],
      received: false
    };

    reset();

    // Add the new message to the user's cache
    queryClient.setQueryData(['messages', newMessage.conversationId], (prevData: any) => {
      if (!prevData || !prevData.pages || prevData.pages.length === 0) {
        return {
          pages: [
            {
              items: [newMessage]
            }
          ],
          unseenMessagesCount: 0
        };
      }

      const newData = [...prevData.pages];

      newData[0] = {
        nextPage: newData[0].nextPage + 1,
        items: [newMessage, ...newData[0].items]
      };

      pageMessagesLength = newData[0].items.length;

      return {
        pages: newData,
        pageParams: prevData.pageParams,
        unseenMessagesCount: prevData.unseenMessagesCount
      };
    });

    // Add the conversation to the top of the conversations list
    dispatchConversations({ type: 'move', payload: { conversation } });

    socket.emit(
      'sendMessage',
      {
        conversationId,
        messageId,
        pageMessagesLength: pageMessagesLength,
        createdAt,
        userIds,
        ...data
      },
      // Callback when the message was received by the server
      () => {
        // Set the received status to true in the user's cache
        const updatedMessage = { ...newMessage, received: true };
        queryClient.setQueryData(['messages', conversationId], (prevData: any) => {
          if (!prevData || !prevData.pages || prevData.pages.length === 0) {
            return prevData;
          }

          const newData = prevData.pages.map((page: any) => {
            return {
              nextPage: page.nextPage,
              items: page.items.map((message: Message) => {
                if (message.messageId === updatedMessage.messageId) {
                  return updatedMessage;
                }
                return message;
              })
            };
          });

          return {
            pageParams: prevData.pageParams,
            pages: newData,
            unseenMessagesCount: prevData.unseenMessagesCount
          };
        });
      }
    );
  };

  return (
    <div
      className="
        pt-4 
        px-4 
        border-t 
        border-gray-50
        flex
        pb-2 
        gap-2 
        lg:gap-4 
        w-full
      "
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-2 lg:gap-4 w-full items-center"
      >
        <MessageInput
          id="content"
          register={register}
          errors={errors}
          required
          placeholder="Type your message..."
        />

        <div className="">
          <Link withButton>
            <HiPaperAirplane size={25} className="text-green-400" />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Form;
