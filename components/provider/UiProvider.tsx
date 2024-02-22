'use client';

import React, { useEffect, useState } from 'react';

import CreateGroupChatModal from '@/components/modals/CreateGroupChatModal';
import RemoveContactModal from '../modals/RemoveContactModal';
import MessageStatusModal from '../modals/MessageStatusModal';
import DeleteMessageModal from '../modals/DeleteMessageModal';
import MessageFileModal from '../modals/MessageFileModal';
import ImageModal from '../modals/ImageModal';
import ConversationSheet from '../sheets/ConversationSheet';
import RemoveMemberModal from '../modals/RemoveMemberModal';
import SetAdminStatusModal from '../modals/SetAdminStatusModal';
import LeaveConversationModal from '../modals/LeaveConversationModal';
import DeleteConversationModal from '../modals/DeleteConversationModal';
import UserProfileModal from '../modals/UserProfileModal';
import DeleteAccountModal from '../modals/DeleteAccountModal';

const UiProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateGroupChatModal />
      <RemoveContactModal />
      <MessageStatusModal />
      <DeleteMessageModal />
      <MessageFileModal />
      <ImageModal />
      <RemoveMemberModal />
      <SetAdminStatusModal />
      <LeaveConversationModal />
      <DeleteConversationModal />
      <UserProfileModal />
      <DeleteAccountModal />
      <ConversationSheet />
    </>
  );
};

export default UiProvider;
