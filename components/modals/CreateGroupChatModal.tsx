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
import { useModal } from '@/hooks/useUI';
import { useMain } from '@/hooks/useMain';

import FileUpload from '../FileUpload';
import { toast } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'The conversation name must be at least 2 characters long.'
  }),
  file: z.custom<(Blob & File) | undefined>(),
  memberIds: z.array(z.string()).min(1, {
    message: 'At least one member is required to initiate conversation.'
  })
});

const CreateGroupChatModal = () => {
  const { type, isOpen, onClose } = useModal();
  const router = useRouter();
  const { contacts, dispatchConversations } = useMain();

  const isModalOpen = isOpen && type === 'createGroupChat';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      file: undefined,
      memberIds: []
    }
  });

  const contactsArray = useMemo(() => {
    if (!contacts) return null;

    return Object.values(contacts);
  }, [contacts]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { file, memberIds, name } = values;

    const conversationConfig: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };
    const fileConfig: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    };

    const conversationUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/create`;

    try {
      const res = await axios.post(
        conversationUrl,
        {
          name,
          memberIds,
          isGroup: true,
          isImage: !!file
        },
        conversationConfig
      );

      const { conversation } = res.data;
      dispatchConversations({
        type: 'add',
        payload: { addInfo: { conversation, initMessages: true } }
      });

      if (file) {
        const fileUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/group/image`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', conversation.conversationId);
        axios.post(fileUrl, formData, fileConfig).catch(() => {}); // error handled by the main provider if the image fails to upload
      }

      handleClose();
      router.push(`/conversations/${conversation.conversationId}`);
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    }
  };

  const handleClose = () => {
    // @ts-ignore
    form.setValue('file', undefined);
    form.setValue('name', '');
    form.setValue('memberIds', []);

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
                name="memberIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold">members</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading}
                        options={
                          contactsArray
                            ? contactsArray.map((contact) => ({
                                value: contact.userId,
                                label: contact.username
                              }))
                            : undefined
                        }
                        onChange={(newValue, actionMeta) => {
                          if (actionMeta.action === 'select-option') {
                            // @ts-ignore
                            const value = newValue[newValue.length - 1].value;

                            if (typeof value !== 'string') return;
                            field.onChange([...(field.value as string[]), value]);
                          }

                          if (actionMeta.action === 'clear') field.onChange([]);

                          if (actionMeta.action === 'remove-value') {
                            const filterdValues = field.value?.filter(
                              // @ts-expect-error
                              (value) => value !== actionMeta.removedValue.value
                            );
                            field.onChange(filterdValues);
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

export default CreateGroupChatModal;
