'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSocket } from '@/hooks/useSocket';
import { Conversation, Message, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useConversationParams from '@/hooks/useConversationParams';
import { useMain } from '@/hooks/useMain';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { EmojiPicker } from '@/components/EmojiPicker';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/hooks/useSession';
import { Plus, Send } from 'lucide-react';

const formSchema = z.object({
  content: z.string().min(1)
});

type FormProps = {
  conversation: Conversation;
};

const ChatInput: React.FC<FormProps> = ({ conversation }) => {
  const queryClient = useQueryClient();
  const { conversationId } = useConversationParams();
  const { userProfile, dispatchConversations } = useMain();
  const { socket } = useSocket();
  const maxHeight = 150; // Maximum allowed height in pixels
  const lineHeight = 10; // Line height of the textarea content

  /**
   * Array of user IDs representing the other users in the chat.
   *
   * This array is sent in the socket body when a message is sent,
   * allowing the other users to receive the message.
   */
  const memberIds = useMemo<string[]>(() => {
    return (
      !conversation.isGroup
        ? [(conversation.otherMember as User).userId as string]
        : (conversation.otherMembers as User[]).map((user) => user.userId)
    ) as string[];
  }, [conversation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ''
    }
  });

  let content = form.watch('content');

  const calculateHeight = () => {
    const lines = Math.ceil(content.length / 35); // Assuming 40 characters per line
    const height = lines * lineHeight;
    return Math.min(height, maxHeight);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const messageId = uuidv4();
    const sentAt = new Date();

    // The number of messages in the current page, set as 1 if there were no previous messages
    let pageMessagesLength = 1;

    let newMessage = {
      conversationId,
      messageId,
      sentAt: sentAt.toLocaleString(),
      sender: userProfile,
      content: data.content,
      seenStatus: [],
      deliverStatus: [],
      notReceived: true
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

    socket.emit(
      'sendMessage',
      {
        conversationId,
        messageId,
        pageMessagesLength: pageMessagesLength,
        sentAt,
        ...data,
        memberIds
      },
      // Callback when the message was received by the server
      () => {
        // Set the received status to true in the user's cache
        const updatedMessage = { ...newMessage, notReceived: false };
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

    // Add the conversation to the top of the conversations list
    dispatchConversations({ type: 'move', payload: { conversation } });
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
                <div className="flex w-full items-center">
                  <div className="relative py-4 pl-4 pb-4 w-full">
                    <button
                      type="button"
                      onClick={() => {}}
                      className="absolute bottom-7 mt-0.5  left-7 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                    >
                      <Plus className="text-white dark:text-[#313338] lg:w-4 lg:h-4 w-3 h-3" />
                    </button>
                    <Textarea
                      id="content"
                      contentEditable={true}
                      className="block lg:pl-14 pl-10 lg:py-4 py-2 lg:min-h-[52px] min-h-[40px] resize-none scrollable-content bg-zinc-200/90 dark:bg-zinc-700/75 border-none rounded-l-3xl focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                      placeholder={`Type your message`}
                      style={{ height: `${calculateHeight()}px` }}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                    />
                  </div>
                  <div
                    className="flex flex-col justify-end lg:min-h-[52px] min-h-[40px] lg:pb-4 pb-3 px-2 rounded-r-3xl bg-zinc-200/90 dark:bg-zinc-700/75 transition"
                    style={{ height: `${calculateHeight()}px` }}
                  >
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value}${emoji}`)
                      }
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <button className=" bg-slate-300 dark:bg-slate-500 mx-2 rounded-full lg:p-3 p-2">
          <Send className="lg:w-5 lg:h-5 w-4 h-4" />
        </button>
      </form>
    </Form>
  );
};

export default ChatInput;
