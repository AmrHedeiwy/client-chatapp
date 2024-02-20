'use client';

import React, { useCallback, useState } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
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
import { AlertTriangle } from 'lucide-react';
import useConversationParams from '@/hooks/useConversationParams';
import { useMain } from '@/hooks/useMain';
import { toast } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const SetAdminStatusModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isOpen, type, onClose, data } = useModal();
  const { conversationId } = useConversationParams();
  const { dispatchConversations } = useMain();

  const isModalOpen = isOpen && type === 'confirmAdminStatus';

  const { adminStatus } = data;

  const onSetStatus = useCallback(async () => {
    setIsLoading(true);

    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/group/admin`;
    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    try {
      await axios.patch(
        url,
        {
          conversationId,
          setStatus: adminStatus?.setStatus,
          memberId: adminStatus?.memberId
        },
        config
      );

      dispatchConversations({
        type: 'update',
        payload: {
          updateInfo: {
            conversationId,
            field: 'adminIds',
            action: adminStatus?.setStatus,
            data: { memberId: adminStatus?.memberId }
          }
        }
      });

      onClose();
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    } finally {
      setIsLoading(false);
    }
  }, [adminStatus, conversationId, dispatchConversations, router, onClose]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="sm:flex sm:items-start">
            <div
              className="
                mx-auto 
                flex 
                h-12 
                w-12 
                flex-shrink-0 
                items-center 
                justify-center 
                rounded-full 
                bg-red-100 
                sm:mx-0 
                sm:h-10 
                sm:w-10
          "
            >
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div
              className="
                mt-3 
                text-center 
                sm:ml-4 
                sm:mt-0 
                sm:text-left
            "
            >
              <AlertDialogTitle>Admin Status Confirmation</AlertDialogTitle>

              <AlertDialogDescription className="mt-2">
                Are you sure you want to {adminStatus?.setStatus} {adminStatus?.username}?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSetStatus} disabled={isLoading}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SetAdminStatusModal;
