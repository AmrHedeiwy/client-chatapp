'use client';

import { MessageStatus, Profile } from '@/types';
import Avatar from '@/components/Avatar';
import { format } from 'date-fns';
import { cn, toast } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Check,
  CheckCheck,
  Edit,
  File,
  Info,
  ShieldCheck,
  ShieldHalf,
  Trash
} from 'lucide-react';
import { ActionTooltip } from '@/components/ActionTooltip';
import { useModal } from '@/hooks/useUI';
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
import { useMain } from '@/hooks/useMain';
import { Skeleton } from '@/components/ui/skeleton';
import useOnClickOutside from '@/hooks/useOnClickOutside';

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
  isGroup: boolean;
  adminIds?: string[];
  groupCreatedById: string | null;
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
  previousMessageSenderId,
  adminIds,
  groupCreatedById
}: ItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { userProfile } = useMain();
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useOnClickOutside(messageRef, () => setIsEditing(false));

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      content: ''
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onEdit = async (values: z.infer<typeof formSchema>) => {
    const memberIds = status.map((userStatus) => userStatus.profile.userId);
    const updatedAt = new Date();

    if (!!socket) {
      socket.emit(
        'edit_message',
        {
          messageId,
          ...values,
          updatedAt,
          memberIds,
          conversationId
        },
        (error?: { message: string }) => {
          if (!!error) return toast('error', error.message);

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
        }
      );
    }

    form.reset();
    setIsEditing(false);
  };

  const fileType = fileUrl?.split('.').pop();

  const isCurrentUserAdmin = isGroup && adminIds && adminIds.includes(socket?.id ?? ''); // The socket id contains the current user's userId
  const isSenderAdmin = isGroup && adminIds && adminIds.includes(sender.userId);

  const isOwn = userProfile.userId === sender.userId;
  const isSenderGroupCreator = groupCreatedById === sender.userId;
  const canDeleteMessage = !deleted && (isCurrentUserAdmin || isOwn);
  const canEditMessage = !deleted && isOwn && !fileUrl;
  const isPDF = fileType === 'pdf' && fileUrl;
  const isImage = !isPDF && fileUrl;
  const isSameSenderFromPreviousMessage = sender.userId === previousMessageSenderId;
  const isDelivered = deliverCount === status.length;
  const isSeen = seenCount === status.length;

  const container = cn(
    'flex gap-2 items-start w-full m-0.5',
    isOwn && 'justify-end',
    isGroup && !isOwn && isSameSenderFromPreviousMessage && 'lg:pl-12 pl-10'
  );
  const avatar = cn(!isOwn && 'cursor-pointer hover:scale-105');

  const messageHeader = isGroup && !isOwn && (
    <div className="flex justify-between h-5">
      <p className="font-semibold text-slate-950 dark:text-slate-500 text-sm hover:underline cursor-pointer">
        ~ {sender.username}
      </p>
      {isGroup && isSenderAdmin && (
        <ActionTooltip label={isSenderGroupCreator ? 'Creator' : 'Admin'} side="right">
          {isSenderGroupCreator ? (
            <ShieldCheck size={16} className="text-indigo-500" />
          ) : (
            <ShieldHalf size={16} className="text-red-500" />
          )}
        </ActionTooltip>
      )}
    </div>
  );
  const messageFooter = (
    <div
      className={cn('flex text-xs justify-end', updated && !deleted && 'justify-between')}
    >
      {updated && !deleted && (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">(edited)</span>
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

  const messageContent = content && !isEditing && (
    <div
      className={cn(
        'break-words select-none whitespace-pre-wrap lg:max-w-[450px] max-w-[250px] min-w-[160px] flex flex-col p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md',
        isOwn && 'bg-green-50 dark:bg-emerald-950',
        isOwn && isGroup && 'min-w-[130px]'
      )}
    >
      {messageHeader}
      <p
        className={cn(
          'text-sm text-zinc-600 dark:text-zinc-300',
          deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1'
        )}
      >
        {content}
      </p>

      {messageFooter}
    </div>
  );
  const messageFile = fileUrl && (
    <div
      className={cn(
        'flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-md',
        isOwn && 'bg-green-50 dark:bg-emerald-950'
      )}
    >
      {!isOwn && <div className={cn(isGroup && 'p-1')}>{messageHeader}</div>}
      {fileUrl.startsWith('pending') ? (
        <Skeleton className={cn('w-64 h-64 ', isPDF && 'w-56 h-14')} />
      ) : (
        <>
          {isImage && (
            <Image
              alt="Image"
              height="200"
              width="250"
              onClick={() => onOpen('viewImage', { viewImage: { image: fileUrl } })}
              src={fileUrl}
              className="border object-cover cursor-pointer transition translate"
            />
          )}

          {isPDF && (
            <div className="flex items-center w-44 pl-2">
              <File className="h-10 fill-blue-200 stroke-blue-400" />

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                PDF File
              </a>
            </div>
          )}
          <div className="p-1">{messageFooter}</div>
        </>
      )}
    </div>
  );

  return (
    <div className={container} id={messageId} ref={messageRef}>
      {isGroup && !isOwn && !isSameSenderFromPreviousMessage && (
        <div className={avatar}>
          <Avatar custom="lg:w-10 lg:h-10 w-8 h-8" imageUrl={sender.image} />
        </div>
      )}
      <ContextMenu>
        <ContextMenuTrigger>
          {messageFile}

          {messageContent}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                className="flex items-center w-full gap-x-2 pt-2"
                onSubmit={form.handleSubmit(onEdit)}
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Textarea
                            rows={1}
                            className="bg-zinc-200/90 max-h-[150px] dark:bg-zinc-700/75 border-none focus:border-none rounded resize-none scrollable-content"
                            placeholder={`Type your message`}
                            onChange={(event) => {
                              field.onChange(event.target.value);
                              const textarea = event.target;
                              textarea.style.height = 'auto';
                              textarea.style.height = textarea.scrollHeight + 'px';
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
            </Form>
          )}
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
                <Trash size={18} className="text-red-600" />
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
