'use client';

import React, { Reducer, useEffect, useReducer, useState } from 'react';

import { GroupChatModal } from '@/components/modals/GroupChatModal';
import RemoveContactModal from '../modals/RemoveContactModal';

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
    </>
  );
};
