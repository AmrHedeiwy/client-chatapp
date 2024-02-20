'use client';

import React, { useCallback, useState } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useRouter } from 'next/navigation';
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

const DeleteConversationModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, type, onClose, data } = useModal();
  const { conversationId } = useConversationParams();
  const { dispatchConversations } = useMain();
  const router = useRouter();

  const isModalOpen = isOpen && type === 'deleteConversation';

  const { conversation } = data;

  const onDelete = useCallback(async () => {
    setIsLoading(true);

    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/${
      conversation?.isGroup ? 'group' : 'single'
    }/${conversationId}`;

    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    try {
      if (conversation?.isGroup) await axios.delete(url, config);
      if (!conversation?.isGroup) await axios.put(url, {}, config);

      dispatchConversations({
        type: 'remove',
        payload: { removeInfo: { conversationId } }
      });
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, conversationId, dispatchConversations, router]);

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
              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>

              <AlertDialogDescription className="mt-2">
                {conversation?.isGroup
                  ? `Are you sure you want to delete the group conversation ${conversation?.name}? Deleting this conversation will remove all messages and media exchanged within the group. This action cannot be undone.`
                  : `Are you sure you want to delete this conversation? Deleting this conversation will remove all messages and media exchanged with ${conversation?.name}. This action cannot be undone.`}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isLoading}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConversationModal;
