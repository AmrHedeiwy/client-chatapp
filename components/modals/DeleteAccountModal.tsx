'use client';

import { useCallback } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog';
import { useModal } from '@/hooks/useUI';
import { toast } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import axios, { AxiosRequestConfig } from 'axios';
import { useSession } from '@/hooks/useSession';

const DeleteMessageModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const session = useSession();

  const isModalOpen = isOpen && type === 'deleteAccount';

  const onDelete = useCallback(async () => {
    if (!session) return;
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/users/delete`;
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };

    try {
      await axios.delete(url, config);

      session.setSession(null);
      router.replace('/');
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    } finally {
      onClose();
    }
  }, [router, onClose, session]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your account? This action can not be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMessageModal;
