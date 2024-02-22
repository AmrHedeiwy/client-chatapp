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
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import useConversationParams from '@/hooks/useConversationParams';
import axios, { AxiosRequestConfig } from 'axios';

const DeleteMessageModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === 'deleteAccount';

  const onDelete = useCallback(async () => {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/users/delete`;
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };

    try {
      await axios.delete(url, config);

      router.replace('/');
    } catch (e: any) {
      onClose();
      toast(
        'error',
        'Oops, something went wrong. Please try again later or contact support if the problem persists.'
      );
    }
  }, [router, onClose]);

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
