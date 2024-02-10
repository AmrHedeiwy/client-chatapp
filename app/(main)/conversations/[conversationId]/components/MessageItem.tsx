'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Message, MessageStatus, User } from '@/types';
import Avatar from '@/components/Avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useSession } from '@/hooks/useSession';
import { useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, File, Info, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { ActionTooltip } from '@/components/ActionTooltip';
import { useMain } from '@/hooks/useMain';
import { useModal } from '@/hooks/useModal';

interface MessageItemProps {
  id: string;
  content: string;
  fileUrl: string | null;
  timestamp: string;
  isNotReceived: boolean;
  deliverCount: number;
  seenCount: number;
  status: any;
  sender: User;
  previousSenderId: string | null;
  deleted: boolean;
  updated: boolean;
  isGroup: boolean;
  isAdmin?: boolean;
  message: Message;
}

const formSchema = z.object({
  content: z.string().min(1)
});

const MessageItem = ({
  id,
  content,
  sender,
  timestamp,
  fileUrl,
  isNotReceived,
  deliverCount,
  seenCount,
  status,
  deleted,
  updated,
  isGroup,
  isAdmin,
  previousSenderId
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { userProfile } = useMain();
  const { onOpen } = useModal();

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
      // do something

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fileType = fileUrl?.split('.').pop();

  const isGroupAdmin = isGroup && isAdmin;
  const isOwn = userProfile.userId === sender.userId;
  const canDeleteMessage = !deleted && (isGroupAdmin || isOwn);
  const canEditMessage = !deleted && isOwn && !fileUrl;
  const isPDF = fileType === 'pdf' && fileUrl;
  const isImage = !isPDF && fileUrl;
  const isSameSenderFromPreviousMessage = sender.userId === previousSenderId;
  const isDelivered = deliverCount === status.length;
  const isSeen = seenCount === status.length;

  const container = cn('flex gap-2 items-start w-full p-0.5', isOwn && 'justify-end');
  const body = cn(
    isOwn && 'items-end justify-end',
    isGroup && !isOwn && isSameSenderFromPreviousMessage && 'lg:pl-12 pl-10'
  );
  const avatar = cn(isOwn && 'order-2 cursor-pointer');
  const messageContainer = cn(
    'break-words whitespace-pre-wrap lg:max-w-[450px] max-w-[250px] min-w-[160px] flex flex-col rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2',
    isOwn && 'justify-end bg-green-50 dark:bg-emerald-950',
    isOwn && isGroup && 'min-w-[130px]'
  );
  const message = cn(
    'text-sm text-zinc-600 dark:text-zinc-300',
    deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1'
  );

  return (
    <div className={container}>
      {isGroup && !isOwn && !isSameSenderFromPreviousMessage && (
        <div className={avatar}>
          <Avatar customSize="lg:w-10 lg:h-10 w-8 h-8" imageUrl={sender.image} />
        </div>
      )}

      <div className={body}>
        {isImage && (
          <div className="flex flex-col">
            <Image
              alt="Image"
              height="220"
              width="193"
              // onClick={() => setImageModalOpen(true)}
              src={fileUrl}
              className="
                rounded-t-md mt-2 border
                object-cover 
                cursor-pointer  
                transition 
                translate
              "
            />
            <span className="flex justify-end text-xs text-zinc-500 dark:text-zinc-400 rounded-b-md bg-zinc-100 dark:bg-zinc-800 p-1">
              {format(new Date(timestamp), 'p')}
            </span>
          </div>
        )}

        {isPDF && (
          <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
            <File className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              PDF File
            </a>
          </div>
        )}

        {!fileUrl && !isEditing && (
          <div className={messageContainer}>
            {isGroup && !isOwn && (
              <div className="flex justify-between">
                <p className="font-semibold text-slate-950 dark:text-slate-500 text-sm hover:underline cursor-pointer">
                  ~ {sender.username}
                </p>
                {isGroup && isAdmin && (
                  <ActionTooltip label="Admin" side="right">
                    <ShieldAlert className="h-4 w-4 ml-2 text-rose-500 mt-1 mr-1" />
                  </ActionTooltip>
                )}
              </div>
            )}

            <p className={message}>
              {content}
              {updated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>

            <div
              className={cn('flex text-xs justify-between mt-1', !isOwn && 'justify-end')}
            >
              {isOwn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Info
                      size={12}
                      className="cursor-pointer text-yellow-900 dark:text-zinc-400"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit" side="left">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        onOpen('messageStatus', { messageStatus: { status, isGroup } })
                      }
                    >
                      status
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">edit</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <span className="flex gap-x-1 text-xs text-zinc-500 dark:text-zinc-400">
                <p>{format(new Date(timestamp), 'p')}</p>
                {!isNotReceived && !isDelivered && isOwn && <Check size={15} />}
                {(isDelivered || isSeen) && isOwn && (
                  <CheckCheck
                    size={15}
                    className={cn(isSeen && 'text-teal-500 dark:text-blue-500')}
                  />
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
