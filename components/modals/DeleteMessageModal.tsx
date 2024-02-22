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

const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { conversationId } = useConversationParams();

  const isModalOpen = isOpen && type === 'deleteMessage';

  const onDelete = useCallback(async () => {
    const { deleteMessage } = data;

    if (!deleteMessage) return onClose();

    const deletedAt = Date.now();

    try {
      if (!!socket)
        socket.emit(
          'delete_message',
          { ...deleteMessage, deletedAt },
          (error?: { message: string }) => {
            if (!!error) return toast('error', error.message);

            queryClient.setQueryData(['messages', conversationId], (prevData: any) => {
              const newData = prevData.pages.map((page: any) => {
                return {
                  ...page,
                  items: page.items.map((item: any) => {
                    if (item.messageId === deleteMessage.messageId) {
                      return {
                        ...item,
                        content: 'This message was deleted',
                        deletedAt
                      };
                    }
                    return item;
                  })
                };
              });

              return {
                ...prevData,
                pages: newData
              };
            });
          }
        );
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    }
  }, [data, conversationId, queryClient, socket, router, onClose]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Message</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to do this? <br />
            The message will be permanently deleted.
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
