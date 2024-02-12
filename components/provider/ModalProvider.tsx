'use client';

import React, { Reducer, useEffect, useReducer, useState } from 'react';

import GroupChatModal from '@/components/modals/GroupChatModal';
import RemoveContactModal from '../modals/RemoveContactModal';
import MessageStatusModal from '../modals/MessageStatusModal';
import DeleteMessageModal from '../modals/DeleteMessageModal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <GroupChatModal />
      <RemoveContactModal />
      <MessageStatusModal />
      <DeleteMessageModal />
    </>
  );
};
