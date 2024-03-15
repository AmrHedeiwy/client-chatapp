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
import { useQueryClient } from '@tanstack/react-query';

const RemoveConversationModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isOpen, type, onClose, data } = useModal();
  const { conversationId } = useConversationParams();
  const { dispatchConversations } = useMain();
  const queryclient = useQueryClient();

  const isModalOpen = isOpen && type === 'removeConversation';

  const { conversation } = data;

  const onLeave = useCallback(async () => {
    setIsLoading(true);
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/group/${conversationId}/members/${conversation?.memberId}`;
    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    try {
      await axios.delete(url, config);

      dispatchConversations({
        type: 'remove',
        payload: {
          removeInfo: { conversationId }
        }
      });

      queryclient.removeQueries({ queryKey: ['messages', conversationId] });

      conversation?.onCloseSheet();

      router.replace('/conversations');
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, conversationId, queryclient, dispatchConversations, router]);

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
              <AlertDialogTitle>Leave Group Conversation</AlertDialogTitle>

              <AlertDialogDescription className="mt-2">
                Are you sure you want to leave the group conversation {conversation?.name}
                ? You will no longer receive messages from this group and will be removed
                from the participant list. Your messages and contributions will remain
                visible to other participants.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onLeave} disabled={isLoading}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveConversationModal;
