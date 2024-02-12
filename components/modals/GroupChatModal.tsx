'use client';

import axios, { AxiosRequestConfig } from 'axios';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/select';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useModal } from '@/hooks/useModal';
import { useMain } from '@/hooks/useMain';

import FileUpload from '../FileUpload';

const isFileBlob = (value: unknown): value is Blob & File =>
  value instanceof Blob && value instanceof File;

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Group name is required.'
  }),
  file: z.custom<Blob & File>(
    (value) => {
      if (!isFileBlob(value)) {
        return undefined;
      }
      return value;
    },
    { message: 'You must choose a picture for your group' }
  ),
  members: z.array(z.string()).min(1)
});

const GroupChatModal = () => {
  const { type, isOpen, onClose } = useModal();
  const { conversations } = useMain();
  const router = useRouter();
  const { dispatchConversations } = useMain();
  const queryClient = useQueryClient();

  const isModalOpen = isOpen && type === 'createGroupChat';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      file: undefined,
      members: []
    }
  });

  const singleConversationsArray = useMemo(() => {
    if (!conversations) return null;

    return Object.values(conversations).filter((conversation) => !conversation.isGroup);
  }, [conversations]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { file, members, name } = values;
      const formData = new FormData();

      const conversationRouteUrl: string = `http://localhost:5000/conversations/create`;
      const conversationRouteoptions: AxiosRequestConfig = {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      };

      const conversationRouteRes = await axios.post(
        conversationRouteUrl,
        {
          name,
          members,
          isGroup: true
        },
        conversationRouteoptions
      );

      const { conversation } = conversationRouteRes.data;

      const fileRouteUrl: string = `http://localhost:5000/file?conversationId=${conversation.conversationId}`;
      const fileRouteoptions: AxiosRequestConfig = {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      formData.append('file', file);
      const fileRouteRes = await axios.post(fileRouteUrl, formData, fileRouteoptions);

      conversation.image = fileRouteRes.data.fileUrl;

      dispatchConversations({ type: 'add', payload: { conversation } });

      // Initialize the messages for the conversation in the user's cache
      await queryClient.setQueryData(['messages', conversation.conversationId], {
        pages: [{ items: [], nextPage: 0 }],
        pageParams: 0,
        unseenMessagesCount: 0
      });

      // @ts-ignore
      form.setValue('file', undefined);
      form.setValue('name', '');
      form.setValue('members', []);

      onClose();
      router.push(`/conversations/${conversation.conversationId}`);
    } catch (error) {}
  };

  const handleClose = () => {
    // @ts-ignore
    form.setValue('file', undefined);
    form.setValue('name', '');
    form.setValue('members', []);

    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize your group
          </DialogTitle>
          <DialogDescription className="text-center ">
            Give your group a personality with a name and an image. You can always change
            it later.
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
                          value={field.value}
                          onChange={field.onChange}
                          isModalOpen={isOpen}
                          setError={form.setError}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold">name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold">members</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading}
                        options={
                          singleConversationsArray
                            ? singleConversationsArray.map((conversation) => ({
                                value: conversation.otherMember?.userId,
                                label: conversation.otherMember?.username
                              }))
                            : undefined
                        }
                        onChange={(newValue, actionMeta) => {
                          if (actionMeta.action === 'select-option') {
                            // @ts-ignore
                            const value = newValue[newValue.length - 1].value;

                            if (typeof value !== 'string') return;
                            form.setValue('members', [...field.value, value]);
                            console.log(field.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4">
              <Button disabled={isLoading}>Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupChatModal;
