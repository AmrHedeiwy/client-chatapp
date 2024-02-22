'use client';

import { useModal } from '@/hooks/useUI';
import Image from 'next/image';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pen, X } from 'lucide-react';
import { z } from 'zod';
import { format } from 'date-fns';
import Avatar from '../Avatar';
import { FileRejection, useDropzone } from 'react-dropzone';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/config/file';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosRequestConfig } from 'axios';
import { useMain } from '@/hooks/useMain';
import { toast } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { FormErrorProps } from '@/types/Axios';

const accountSchema = z.object({
  username: z
    .string()
    .refine(
      (value) => {
        if (value === null) return true;
        if (value.match(/^[A-Za-z\d_-]{3,20}$/)) return true;

        return false;
      },
      {
        message:
          'Username can only contain letters, digits, underscores, and hyphens, and must be between 3 and 20 characters long.'
      }
    )
    .nullable(),
  email: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === null) return true;

        return !!value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      },
      { message: 'Please enter a valid email address in the format example@example.com.' }
    )
    .nullable(),
  file: z.custom<Blob & File>().nullable()
});

const passwordSchema = z.object({
  currentPassword: z.string().trim().min(1, { message: 'Current Password is required' }),
  newPassword: z
    .string()
    .trim()
    .min(1, { message: 'New Password is required' })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character from the set @$!%?&.'
    })
});

const UserProfileModal = () => {
  const { isOpen, type, onClose } = useModal();
  const [preview, setPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account');
  const { userProfile, setUserProfile } = useMain();
  const router = useRouter();

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: null,
      email: null,
      file: null
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: ''
    }
  });

  const isLoadingAccount = accountForm.formState.isSubmitting;
  const isLoadingPassword = passwordForm.formState.isSubmitting;

  const onSubmitAccount = async (values: z.infer<typeof accountSchema>) => {
    const { file, username, email } = values;

    if (!file && !username && !email) return;

    try {
      if (!!file) {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/users/avatar`;
        const config: AxiosRequestConfig = {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        };

        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post(url, formData, config);

        setPreview(null);
        setUserProfile((prev) => {
          const newProfile = { ...prev };
          newProfile.image = res.data.image;

          return newProfile;
        });
      }

      if (!!username || !!email) {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/users/edit`;
        const config: AxiosRequestConfig = {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        };
        const body = {
          ...(!!username && { username }),
          ...(!!email && { email })
        };
        if (body.username === userProfile.username || body.email === userProfile.email)
          return;
        const res = await axios.put(url, body, config);

        setUserProfile((prev) => {
          const newProfile = { ...prev, ...body };

          return newProfile;
        });

        if (res.data.redirect) router.replace(res.data.redirect);
      }

      accountForm.reset();
      toast('success', 'Your profile has been successfully updated!');
    } catch (e: any) {
      const error = e.response.data.error;
      if (error && error.name === 'JoiValidationError') {
        (error.message as FormErrorProps[]).forEach(({ fieldName, fieldMessage }) => {
          // @ts-ignore
          accountForm.setError(fieldName, { message: fieldMessage });
        });
      } else {
        toast('error', error.message);
      }

      if (error.redirect) router.push(error.redirect);
    }
  };
  const onSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/users/password`;
    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    try {
      const res = await axios.patch(url, values, config);

      toast('success', res.data.message);

      if (res.data.redirect) router.push(res.data.redirect);
      passwordForm.reset();
    } catch (e: any) {
      const error = e.response.data.error;
      if (error && error.name === 'JoiValidationError') {
        (error.message as FormErrorProps[]).forEach(({ fieldName, fieldMessage }) => {
          // @ts-ignore
          passwordForm.setError(fieldName, { message: fieldMessage });
        });
      } else {
        toast('error', error.message);
      }

      if (error.redirect) router.push(error.redirect);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length !== 0) {
        const firstFileError = rejectedFiles[0].errors[0];

        if (firstFileError.code === 'file-invalid-type')
          firstFileError.message = 'File must be an image';

        if (firstFileError.code === 'file-too-large')
          firstFileError.message = 'File is larger than 4MB';

        // For code 'too-many-files', use the default error message -> 'Too many files'

        accountForm.setError('file', { message: firstFileError.message });
      }
      acceptedFiles.forEach((file) => {
        accountForm.setValue('file', file);
        accountForm.setError('file', { message: '' });
        const url = URL.createObjectURL(file);
        setPreview(url);
      });
    },
    [type]
  );
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ALLOWED_FILE_TYPES.image
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop
  });

  const isModalOpen = isOpen && type === 'userProfile';

  if (!userProfile) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="">
        <Tabs defaultValue={activeTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account" onClick={() => setActiveTab('account')}>
              Account
            </TabsTrigger>
            <TabsTrigger value="password" onClick={() => setActiveTab('password')}>
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="border-none">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Make changes to your account here. Click save when you're done.
                </CardDescription>
              </CardHeader>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onSubmitAccount)}>
                  <CardContent className="space-y-2">
                    <div className="flex flex-col lg:flex-row items-center gap-x-4">
                      <div className="flex flex-col">
                        <FormField
                          control={accountForm.control}
                          name="file"
                          render={() => (
                            <FormItem className="flex flex-col justify-center items-center">
                              <FormMessage />
                              {!preview ? (
                                <div
                                  className="relative flex justify-center"
                                  {...getRootProps()}
                                >
                                  <Avatar
                                    imageUrl={userProfile.image}
                                    custom="lg:w-20 lg:h-20 w-20 h-20"
                                  />
                                  <button
                                    className="bg-zinc-200 dark:bg-zinc-600 p-1 rounded-full absolute top-0 right-0 shadow-sm"
                                    type="button"
                                  >
                                    <Pen className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="relative flex justify-center 6">
                                  <Avatar
                                    imageUrl={preview}
                                    custom="lg:w-20 lg:h-20 w-20 h-20"
                                  />
                                  <button
                                    onClick={() => {
                                      if (preview) {
                                        URL.revokeObjectURL(preview);
                                        setPreview(null);
                                        accountForm.setValue('file', null);
                                      }
                                    }}
                                    className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
                                    type="button"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </FormItem>
                          )}
                        />

                        <input {...getInputProps()} />

                        <span className="flex items-center text-center gap-x-1 text-xs text-muted-foreground">
                          Joined{' '}
                          {userProfile.createdAt
                            ? format(new Date(userProfile.createdAt), 'dd MMMM yyy')
                            : 'server is acting sus today, idk why it does not want to load the date'}
                        </span>
                      </div>

                      <div className="flex flex-col w-full gap-y-1">
                        <FormField
                          control={accountForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Username"
                                  disabled={field.disabled}
                                  name={field.name}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                  defaultValue={userProfile.username}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Email"
                                  disabled={field.disabled}
                                  name={field.name}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                  defaultValue={userProfile.email}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end">
                    <Button disabled={isLoadingAccount}>Save changes</Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card className="border-none">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you'll be logged out.
                </CardDescription>
              </CardHeader>

              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
                  <CardContent className="space-y-2">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input placeholder="Current Password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl>
                            <Input placeholder="New password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button disabled={isLoadingPassword}>Save password</Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
