'use client';

import { MessageStatus, Profile } from '@/types';
import Avatar from '@/components/Avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Check, CheckCheck, Edit, File, Info, ShieldAlert, Trash } from 'lucide-react';
import { ActionTooltip } from '@/components/ActionTooltip';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

interface ItemProps {
  messageId: string;
  conversationId: string;
  content: string | null;
  fileUrl: string | null;
  sentAt: string;
  isNotReceived: boolean;
  deliverCount: number;
  seenCount: number;
  status: MessageStatus[];
  sender: Profile;
  previousMessageSenderId: string | null;
  deleted: boolean;
  updated: boolean;
  isOwn: boolean;
  isGroup: boolean;
  isSenderAdmin: boolean;
  isCurrentUserAdmin: boolean;
}

const formSchema = z.object({
  content: z.string().min(1)
});

const Item = ({
  messageId,
  conversationId,
  content,
  fileUrl,
  sentAt,
  sender,
  isNotReceived,
  deliverCount,
  seenCount,
  status,
  deleted,
  updated,
  isGroup,
  isSenderAdmin,
  previousMessageSenderId,
  isOwn,
  isCurrentUserAdmin
}: ItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const textArearRef = useRef<HTMLTextAreaElement | null>(null);
  const calculateHeight = useCallback(() => {
    if (textArearRef.current) {
      const scrollHeight = textArearRef.current.scrollHeight;

      if (scrollHeight > 71) return textArearRef.current.scrollHeight + 'px';
    } // Set new height

    return '10px';
  }, [textArearRef]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keyDown', handleKeyDown);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      content: ''
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const memberIds = status.map((userStatus) => userStatus.user.userId);
      const updatedAt = new Date();

      queryClient.setQueryData(['messages', conversationId], (prevData: any) => {
        const newData = prevData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: any) => {
              if (item.messageId === messageId) {
                return {
                  ...item,
                  ...values,
                  updatedAt
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

      if (!!socket) {
        socket.emit('edit_message', {
          messageId,
          ...values,
          updatedAt,
          memberIds,
          conversationId
        });
      }

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fileType = fileUrl?.split('.').pop();

  const isGroupAdmin = isGroup && isCurrentUserAdmin;
  const canDeleteMessage = !deleted && (isGroupAdmin || isOwn);
  const canEditMessage = !deleted && isOwn && !fileUrl;
  const isPDF = fileType === 'pdf' && fileUrl;
  const isImage = !isPDF && fileUrl;
  const isSameSenderFromPreviousMessage = sender.userId === previousMessageSenderId;
  const isDelivered = deliverCount === status.length;
  const isSeen = seenCount === status.length;

  const container = cn('flex gap-2 items-start w-full p-0.5', isOwn && 'justify-end');
  const body = cn(
    isOwn && 'items-end justify-end',
    isGroup && !isOwn && isSameSenderFromPreviousMessage && 'lg:pl-12 pl-10'
  );
  const avatar = cn(isOwn && 'order-2 cursor-pointer');

  const messageInfo = (
    <div
      className={cn(
        'flex text-xs justify-end mt-0.5',
        updated && !deleted && 'justify-between'
      )}
    >
      {updated && !deleted && (
        <span className="text-[10px]  text-zinc-500 dark:text-zinc-400">(edited)</span>
      )}
      <span className="flex gap-x-1 text-xs text-zinc-500 dark:text-zinc-400">
        <p>{format(new Date(sentAt), 'p')}</p>
        {!deleted && !isNotReceived && !isDelivered && isOwn && <Check size={15} />}
        {!deleted && (isDelivered || isSeen) && isOwn && (
          <CheckCheck
            size={15}
            className={cn(isSeen && 'text-teal-500 dark:text-blue-500')}
          />
        )}
      </span>
    </div>
  );

  return (
    <div className={container} id={messageId}>
      {isGroup && !isOwn && !isSameSenderFromPreviousMessage && (
        <div className={avatar}>
          <Avatar customSize="lg:w-10 lg:h-10 w-8 h-8" imageUrl={sender.image} />
        </div>
      )}
      <ContextMenu>
        <ContextMenuTrigger>
          <div className={body}>
            {isImage && (
              <div className="flex flex-col">
                <Image
                  alt="Image"
                  height="200"
                  width="250"
                  onClick={() => onOpen('viewImage', { viewImage: { image: fileUrl } })}
                  src={fileUrl}
                  className="
                    rounded-t-md 
                    mt-2 
                    border
                    object-cover 
                    cursor-pointer  
                    transition 
                    translate
                  "
                />
                <div className="rounded-b-md bg-zinc-100 dark:bg-zinc-800 p-1">
                  {messageInfo}
                </div>
              </div>
            )}

            {isPDF && (
              <div className="flex flex-col">
                <div className="relative flex items-center p-2 mt-2 w-40 rounded-md bg-background/10">
                  <File className="h-10  fill-blue-200 stroke-blue-400" />
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    PDF File
                  </a>
                </div>
                {messageInfo}
              </div>
            )}

            {!fileUrl && !isEditing && (
              <div
                className={cn(
                  'break-words whitespace-pre-wrap lg:max-w-[450px] max-w-[250px] min-w-[160px] flex flex-col rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2',
                  isOwn && 'justify-end bg-green-50 dark:bg-emerald-950',
                  isOwn && isGroup && 'min-w-[130px]'
                )}
              >
                {isGroup && !isOwn && (
                  <div className="flex justify-between">
                    <p className="font-semibold text-slate-950 dark:text-slate-500 text-sm hover:underline cursor-pointer">
                      ~ {sender.username}
                    </p>
                    {isGroup && isSenderAdmin && (
                      <ActionTooltip label="Admin" side="right">
                        <ShieldAlert className="h-4 w-4 ml-2 text-rose-500 mt-1 mr-1" />
                      </ActionTooltip>
                    )}
                  </div>
                )}

                <p
                  className={cn(
                    'text-sm text-zinc-600 dark:text-zinc-300',
                    deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1'
                  )}
                >
                  {content}
                </p>

                {messageInfo}
              </div>
            )}

            {!fileUrl && isEditing && (
              <Form {...form}>
                <form
                  className="flex items-center w-full gap-x-2 pt-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative w-full">
                            <Textarea
                              id="content"
                              ref={textArearRef}
                              contentEditable={true}
                              className="bg-zinc-200/90 max-h-[150px] dark:bg-zinc-700/75 border-none focus:border-none rounded resize-none scrollable-content"
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
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button disabled={isLoading} size="sm">
                    Save
                  </Button>
                </form>
                <span className="text-[10px] mt-1 text-zinc-400">
                  Press escape to cancel, enter to save
                </span>
              </Form>
            )}
          </div>
        </ContextMenuTrigger>
        {canDeleteMessage && (
          <ContextMenuContent className="w-fit">
            {isOwn && (
              <ContextMenuItem
                onClick={() =>
                  onOpen('messageStatus', { messageStatus: { status, isGroup } })
                }
              >
                <div className="flex gap-x-2">
                  <Info size={18} className="text-blue-800 dark:text-blue-400" />
                  <span>status</span>
                </div>
              </ContextMenuItem>
            )}
            {canEditMessage && (
              <ContextMenuItem onClick={() => setIsEditing(true)}>
                <div className="flex gap-x-2">
                  <Edit size={18} className="text-orange-400 dark:text-orange-300" />
                  <span>edit</span>
                </div>
              </ContextMenuItem>
            )}
            <ContextMenuItem
              onClick={() =>
                onOpen('deleteMessage', { deleteMessage: { messageId, conversationId } })
              }
            >
              <div className="flex gap-x-2">
                <Trash size={18} className="text-red-600 dark:text-red-800" />
                <span>delete</span>
              </div>
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  );
};

export default Item;
