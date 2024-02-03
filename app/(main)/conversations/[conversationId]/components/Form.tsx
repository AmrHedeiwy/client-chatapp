'use client';

import { z } from 'zod';
import { HiPaperAirplane, HiPlus } from 'react-icons/hi2';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSocket } from '@/app/hooks/useSocket';
import { Conversation, Message, User } from '@/app/types';
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useConversationParams from '@/app/hooks/useConversationParams';
import { useMain } from '@/app/hooks/useMain';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { EmojiPicker } from '@/components/EmojiPicker';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/app/hooks/useSession';

const formSchema = z.object({
  content: z.string().min(1)
});

type FormProps = {
  conversation: Conversation;
};

const ChatInput: React.FC<FormProps> = ({ conversation }) => {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const { conversationId } = useConversationParams();
  const { userProfile, dispatchConversations } = useMain();
  const { socket } = useSocket();

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ''
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const messageId = uuidv4();
    const createdAt = new Date();

    // The number of messages in the current page, set as 1 is there were no previous messages
    let pageMessagesLength = 1;

    let newMessage = {
      conversationId,
      messageId,
      createdAt: createdAt.toLocaleString(),
      senderId: session?.userId,
      sender: userProfile,
      content: data.content,
      seenStatus: [],
      deliverStatus: [],
      received: false
    };

    form.reset();

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex justify-between items-center"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="relative py-4 pl-4 pb-4">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="absolute top-8 left-8 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                  >
                    <HiPlus className="text-white dark:text-[#313338]" />
                  </button>
                  <div className="absolute top-8 left-20">
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value}${emoji}`)
                      }
                    />
                  </div>
                  <Textarea
                    id="content"
                    contentEditable={true}
                    className="block pl-28 py-4 resize-none scrollable-content bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    placeholder={`Type your message`}
                    rows={1}
                    style={{
                      lineHeight: '20px',
                      minHeight: '20px'
                    }}
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <button className="rounded-r py-4 px-4 align-middle bg-zinc-200/90 dark:bg-zinc-700/75 mr-6 ">
          <HiPaperAirplane size={20} />
        </button>
      </form>
    </Form>
  );
};

export default ChatInput;
