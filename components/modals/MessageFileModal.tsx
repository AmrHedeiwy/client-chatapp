'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import FileUpload from '../FileUpload';
import { useModal } from '@/hooks/useUI';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useMain } from '@/hooks/useMain';
import { Message } from '@/types';
import { toast } from '@/lib/utils';
import useConversationParams from '@/hooks/useConversationParams';

const isFileBlob = (value: unknown): value is Blob & File =>
  value instanceof Blob && value instanceof File;

const formSchema = z.object({
  file: z.custom<Blob & File>((value) => isFileBlob(value), {
    message: 'Please add an Image or PDF.'
  })
});

const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { userProfile, dispatchConversations } = useMain();
  const { conversationId } = useConversationParams();

  const isModalOpen = isOpen && type === 'messageFile';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined
    }
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!socket) return handleClose();

    const { messageFile } = data;

    if (!messageFile) return onClose();

    const { intialMessageStatus } = messageFile;
    const messageId = uuidv4();
    const sentAt = Date.now();
    const { file } = values;
    const type = file.type.split('/').pop();
    const size = file.size;

    const reader = new FileReader();

    const newMessage = {
      conversationId,
      messageId,
      sentAt: sentAt,
      updatedAt: sentAt,
      deletedAt: null,
      sender: userProfile,
      content: null,
      fileUrl: 'pending.' + type,
      seenCount: 0,
      deliverCount: 0,
      status: intialMessageStatus,
      notReceived: true
    };

    queryClient.setQueryData(['messages', conversationId], (prevData: any) => {
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
        ...newData[0],
        nextPage: newData[0].nextPage + 1,
        items: [newMessage, ...newData[0].items]
      };

      return {
        ...prevData,
        pages: newData
      };
    });

    reader.onload = () => {
      const fileData = reader.result; // This is the file data

      socket.emit(
        'send_message',
        {
          messageId,
          sentAt,
          file: { data: fileData, type, size },
          ...messageFile
        },
        (data: { fileUrl?: string; error?: { message: string } }) => {
          if (!!data.error) {
            toast('error', data.error.message);

            queryClient.setQueryData(['messages', conversationId], (prevData: any) => {
              const newData = prevData.pages.map((page: any) => {
                return {
                  ...page,
                  items: page.items.filter((item: any) => {
                    if (item.messageId !== messageId) return { ...item };
                  })
                };
              });

              return {
                ...prevData,
                pages: newData
              };
            });

            return;
          }

          // Set the received status to true in the user's cache
          const updatedMessage = {
            ...newMessage,
            fileUrl: data.fileUrl,
            notReceived: false
          };

          queryClient.setQueryData(['messages', conversationId], (prevData: any) => {
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
    };

    reader.readAsDataURL(values.file);

    // Add the conversation to the top of the conversations list
    dispatchConversations({
      type: 'move',
      payload: { moveInfo: { conversationId: newMessage.conversationId } }
    });

    handleClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center justify-center">
                      <FormControl>
                        <FileUpload
                          isModalOpen={isModalOpen}
                          setError={form.setError}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="px-6 py-4">
              <Button disabled={isLoading}>Send</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;
