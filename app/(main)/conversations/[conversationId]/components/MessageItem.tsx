'use client';

import { useRouter, useParams } from 'next/navigation';
import { MessageStatus, User } from '@/types';
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
import { Check, CheckCheck, File, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { ActionTooltip } from '@/components/ActionTooltip';

interface MessageItemProps {
  id: string;
  content: string;
  fileUrl: string | null;
  timestamp: string;
  isNotReceived: boolean;
  deliverStatus: MessageStatus[];
  seenStatus: MessageStatus[];
  membersCount: number;
  sender: User;
  previousSenderId: string | null;
  deleted: boolean;
  updated: boolean;
  isGroup: boolean;
  isAdmin?: boolean;
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
  deliverStatus,
  seenStatus,
  membersCount,
  deleted,
  updated,
  isGroup,
  isAdmin,
  previousSenderId
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();
  const { session } = useSession();

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
  const isOwn = session?.userId === sender.userId;
  const canDeleteMessage = !deleted && (isGroupAdmin || isOwn);
  const canEditMessage = !deleted && isOwn && !fileUrl;
  const isPDF = fileType === 'pdf' && fileUrl;
  const isImage = !isPDF && fileUrl;
  const isSameSenderFromPreviousMessage = sender.userId === previousSenderId;
  let isDelivered = deliverStatus.length === membersCount;
  let isSeen = seenStatus.length === membersCount;

  const container = cn('flex gap-2 items-start w-full p-0.5', isOwn && 'justify-end');
  const body = cn(
    isOwn && 'items-end justify-end',
    isGroup && !isOwn && isSameSenderFromPreviousMessage && 'lg:pl-12 pl-10'
  );
  const avatar = cn(isOwn && 'order-2 cursor-pointer');
  const messageContainer = cn(
    'break-all lg:max-w-[450px] max-w-[250px] min-w-[160px] flex flex-col rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2',
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
            <span className="flex mt-0.5 justify-end gap-x-1 text-xs text-zinc-500 dark:text-zinc-400">
              <p>{format(new Date(timestamp), 'p')}</p>
              {!isNotReceived && !isDelivered && isOwn && <Check size={15} />}
              {(isDelivered || isSeen) && isOwn && (
                <CheckCheck size={15} className={cn(isSeen && 'text-blue-500')} />
              )}
            </span>
          </div>
        )}

        {/* <ImageModal src={data.image} isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} /> */}
      </div>
      {/* {isLast && isOwn && seenList.length > 0 && (
          <div 
            className="
            text-xs 
            font-light 
            text-gray-500
            "
          >
            {`Seen by ${seenList}`}
          </div>
        )} */}

      {/* <div className="flex flex-col w-full">
        <div className="flex items-center gap-x-2">
          <div className="flex items-center">
            <p className="font-semibold text-sm hover:underline cursor-pointer">
              {sender.username}
            </p>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {format(new Date(timestamp), 'p')}
          </span>
        </div>
        {isImage && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
          >
            <Image src={fileUrl} alt={content} fill className="object-cover" />
          </a>
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
          <p
            className={cn(
              'text-sm text-zinc-600 dark:text-zinc-300',
              deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1',
              isOwn && 'items-end'
            )}
          >
            {content}
            {updated && !deleted && (
              <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                (edited)
              </span>
            )}
          </p>
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
                        <Input
                          disabled={isLoading}
                          className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                          placeholder="Edited message"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} size="sm" variant="primary">
                Save
              </Button>
            </form>
            <span className="text-[10px] mt-1 text-zinc-400">
              Press escape to cancel, enter to save
            </span>
          </Form>
        )}
      </div>  */}
    </div>
  );
};

export default MessageItem;
