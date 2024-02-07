'use client';

import { useRouter, useParams } from 'next/navigation';
import { User } from '@/types';
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
import { File } from 'lucide-react';

interface MessageItemProps {
  id: string;
  content: string;
  fileUrl: string | null;
  timestamp: string;
  sender: User;
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
  deleted,
  updated,
  isGroup,
  isAdmin
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
  const isOwner = session?.userId === sender.userId;
  const canDeleteMessage = !deleted && (isGroupAdmin || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === 'pdf' && fileUrl;
  const isImage = !isPDF && fileUrl;

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <Avatar imageUrl={sender.image} />
        </div>
        <div className="flex flex-col w-full">
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
                deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1'
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
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
