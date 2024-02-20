'use client';

import { useModal } from '@/hooks/useUI';
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
import { useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useMain } from '@/hooks/useMain';
import { toast } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const RemoveContactModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { dispatchContacts } = useMain();
  const router = useRouter();

  const isModalOpen = isOpen && type === 'removeContact';

  const { contact } = data;

  const onRemove = useCallback(async () => {
    if (!contact || !contact.contactId) return;

    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/contacts/${contact?.contactId}`;
    const config: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      await axios.delete(url, config);

      dispatchContacts({
        type: 'remove',
        payload: { removeInfo: { contactId: contact?.contactId } }
      });
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    }
  }, [contact, dispatchContacts, router]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {contact?.username} from your contacts
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onRemove()}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveContactModal;
