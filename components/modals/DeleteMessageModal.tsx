'use client';

import axios from 'axios';
import { useState } from 'react';

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
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const isModalOpen = isOpen && type === 'deleteMessage';

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      const { deleteMessage } = data;
      if (!deleteMessage) return onClose();

      const deletedAt = Date.now();
      queryClient.setQueryData(
        ['messages', deleteMessage.conversationId],
        (prevData: any) => {
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
        }
      );

      if (!!socket) socket.emit('delete_message', { ...deleteMessage, deletedAt });

      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <AlertDialogAction onClick={onClick}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMessageModal;
