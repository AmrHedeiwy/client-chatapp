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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarRange, Pen, X } from 'lucide-react';
import { format } from 'date-fns';
import Avatar from '../Avatar';
import { FileRejection, useDropzone } from 'react-dropzone';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/config/file';
import { useCallback, useState } from 'react';

const UserProfileModal = () => {
  const { isOpen, type, onClose, data } = useModal();
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length !== 0) {
        const firstFileError = rejectedFiles[0].errors[0];

        if (firstFileError.code === 'file-invalid-type')
          firstFileError.message = 'File must be an image';

        if (firstFileError.code === 'file-too-large')
          firstFileError.message = 'File is larger than 4MB';

        // For code 'too-many-files', use the default error message -> 'Too many files'
      }
      acceptedFiles.forEach((file) => {
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

  const { profile } = data;

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="">
        <Tabs defaultValue="account" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card className="border-none">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Make changes to your account here. Click save when you're done.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-col lg:flex-row items-center gap-x-4">
                  <div className="flex flex-col">
                    {!preview ? (
                      <div className="relative flex justify-center" {...getRootProps()}>
                        <Avatar
                          imageUrl={profile.image}
                          custom="lg:w-20 lg:h-20 w-20 h-20"
                        />
                        <button
                          className="bg-zinc-200 dark:bg-zinc-600 p-1 rounded-full absolute top-1 right-6 lg:right-0 shadow-sm"
                          type="button"
                          onClick={() => {}}
                        >
                          <Pen className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex justify-center 6">
                        <Avatar imageUrl={preview} custom="lg:w-20 lg:h-20 w-20 h-20" />
                        <button
                          onClick={() => {
                            if (preview) {
                              URL.revokeObjectURL(preview);
                              setPreview(null);
                            }
                          }}
                          className="bg-rose-500 text-white p-1 rounded-full absolute top-1 right-5 lg:right-0 shadow-sm"
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <input {...getInputProps()} />

                    <span className="flex items-center text-center gap-x-1 text-xs text-muted-foreground">
                      Joined{' '}
                      {profile.createdAt
                        ? format(new Date(profile.createdAt), 'dd MMMM yyy')
                        : 'server is acting sus today, idk why it does not want to load the date'}
                    </span>
                  </div>

                  <div className="flex flex-col w-full">
                    <div className="space-y-1">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={profile.username} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={profile.email} />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button>Save changes</Button>
              </CardFooter>
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
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
