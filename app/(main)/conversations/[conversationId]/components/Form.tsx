'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSocket } from '@/hooks/useSocket';
import { Conversation, Member, Message, MessageStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useConversationParams from '@/hooks/useConversationParams';
import { useMain } from '@/hooks/useMain';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { EmojiPicker } from '@/components/EmojiPicker';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send } from 'lucide-react';
import { useModal } from '@/hooks/useModal';

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
  const { onOpen } = useModal();
  const textArearRef = useRef<HTMLTextAreaElement | null>(null);

  const intialMessageStatus = useMemo<MessageStatus>(() => {
    const { isGroup, otherMember, otherMembers } = conversation;
    if (!isGroup)
      return {
        [otherMember?.userId as string]: {
          deliverAt: null,
          seenAt: null,
          user: otherMember
        }
      };

    return (otherMembers as Member[]).reduce((acc: any, user) => {
      acc[user.userId] = { deliverAt: null, seenAt: null, user };

      return acc;
    }, {});
  }, [conversation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ''
    }
  });

  const calculateHeight = useCallback(() => {
    if (textArearRef.current) {
      const scrollHeight = textArearRef.current.scrollHeight;

      if (scrollHeight > 71) return textArearRef.current.scrollHeight + 'px';
    } // Set new height

    return '52px';
  }, [textArearRef]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const messageId = uuidv4();
    const sentAt = Date.now();

    // The number of messages in the current page, set as 1 if there were no previous messages
    let pageMessagesLength = 1;

    const newMessage = {
      conversationId,
      messageId,
      sentAt: sentAt,
      updatedAt: sentAt,
      deletedAt: null,
      sender: userProfile,
      content: data.content,
      fileUrl: null,
      seenCount: 0,
      deliverCount: 0,
      status: intialMessageStatus,
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

      return {
        pages: newData,
        pageParams: prevData.pageParams,
        unseenMessagesCount: prevData.unseenMessagesCount
      };
    });

    if (!!socket) {
      socket.emit(
        'sendMessage',
        {
          conversationId,
          messageId,
          pageMessagesLength: pageMessagesLength,
          sentAt,
          intialMessageStatus,
          updatedAt: sentAt,
          ...data
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
                ...page,
                items: page.items.map((message: Message) => {
                  if (message.messageId === updatedMessage.messageId) {
                    return updatedMessage;
                  }
                  return message;
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
    }

    // Add the conversation to the top of the conversations list
    dispatchConversations({
      type: 'move',
      payload: { moveInfo: { conversationId: newMessage.conversationId } }
    });
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
                      onClick={() =>
                        onOpen('messageFile', {
                          messageFile: {
                            conversationId: conversation.conversationId,
                            intialMessageStatus
                          }
                        })
                      }
                      className="absolute lg:bottom-7 bottom-8 mt-0.5 left-7 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                    >
                      <Plus className="text-white dark:text-[#313338] lg:w-4 lg:h-4 w-3 h-3" />
                    </button>
                    <Textarea
                      id="content"
                      ref={textArearRef}
                      contentEditable={true}
                      className="block lg:pl-14 pl-10 py-4 max-h-[150px] lg:min-h-[52px] min-h-[40px] resize-none scrollable-content bg-zinc-200/90 dark:bg-zinc-700/75 border-none rounded-l-3xl focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                      placeholder={`Type your message`}
                      style={{ height: `${calculateHeight()}` }}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      name={field.name}
                      value={field.value}
                    />
                  </div>
                  <div
                    className="flex flex-col justify-end max-h-[150px] lg:min-h-[52px] min-h-[40px] lg:pb-4 pb-4 px-2 rounded-r-3xl bg-zinc-200/90 dark:bg-zinc-700/75 transition"
                    style={{ height: `${calculateHeight()}` || '52px' }}
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
