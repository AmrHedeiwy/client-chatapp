'use client';

import React, { Dispatch, useEffect, useReducer } from 'react';
import { createContext, useState } from 'react';
import { Conversation, GroupedContacts, GroupedConversations, User } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

type MainContextType = {
  userProfile: User;
  conversations: GroupedConversations | null;
  dispatchConversations: Dispatch<conversationActionType>;
  contacts: GroupedContacts | null;
  dispatchContacts: Dispatch<contactActionType>;
};

type SocketProviderProps = {
  intialConversations: GroupedConversations | null;
  intialContacts: GroupedContacts | null;
  currentUserProfile: User;
  children: React.ReactNode;
};
export const MainContext = createContext<MainContextType | undefined>(undefined);

type conversationActionType = {
  type: 'move' | 'add' | 'update' | 'remove';
  payload: {
    conversation?: Conversation;
    updateInfo?: { conversationId: string; data: any };
    removeInfo?: { conversationId: string };
  };
};
type contactActionType = {
  type: 'add' | 'update' | 'remove' | null;
  payload: any;
};

function conversationsReducer(
  conversations: GroupedConversations | null,
  action: conversationActionType
) {
  let { conversation, updateInfo } = action.payload;

  switch (action.type) {
    case 'add':
      if (!conversation) return conversations;

      if (!conversations || !conversations[conversation.conversationId]) {
        return { [conversation.conversationId]: conversation, ...conversations };
      }
      return conversations;
    case 'move':
      if (!conversation) return conversations;

      if (!conversations) return { [conversation.conversationId]: conversation };

      delete conversations[conversation.conversationId];
      return { [conversation.conversationId]: conversation, ...conversations };
    case 'update':
      if (!updateInfo || !conversations) return conversations;

      return {
        ...conversations,
        [updateInfo.conversationId]: {
          ...conversations[updateInfo.conversationId],
          ...updateInfo.data
        }
      };
    case 'remove':
      break;
  }
  return conversations;
}

function contactsReducer(contacts: GroupedContacts | null, action: contactActionType) {
  const contact = action.payload.contact as User;

  switch (action.type) {
    case 'add':
      if (!contacts) return { [contact.userId]: contact };

      let contactsArray = Object.values(contacts);

      let sortedArray = contactsArray.sort(
        (contacta, contactb) =>
          parseInt(contacta.username.charAt(0)) - parseInt(contactb.username.charAt(0))
      );

      return sortedArray.reduce((acc: GroupedContacts, contact) => {
        acc[contact.userId] = contact;
        return acc;
      }, {});
    case 'update':
      if (!contacts) return { [contact.userId]: contact };

      contacts[contact.userId] = contact;
      break;
    case 'remove':
      if (!contacts) return contacts;

      delete contacts[contact.userId];
      break;
  }
  return contacts;
}

const MainProvider = ({
  intialConversations,
  intialContacts,
  currentUserProfile,
  children
}: SocketProviderProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const [userProfile, setUserProfile] = useState(currentUserProfile);
  const [conversations, dispatchConversations] = useReducer(
    conversationsReducer,
    intialConversations
  );
  const [contacts, dispatchContacts] = useReducer(contactsReducer, intialContacts);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_group_chat', async (data: { conversation: Conversation }) => {
      await queryClient.setQueryData(['messages', data.conversation.conversationId], {
        pages: [{ items: [], nextPage: 0 }],
        pageParams: 0,
        unseenMessagesCount: 0
      });

      data.conversation.otherMembers = data.conversation.members.filter(
        (member) => member.userId !== userProfile.userId
      );

      dispatchConversations({
        type: 'add',
        payload: { conversation: data.conversation }
      });
    });

    socket.on(
      'update_conversation',
      (updatedData: { conversationId: string; data: any }) => {
        dispatchConversations({
          type: 'update',
          payload: { updateInfo: updatedData }
        });
      }
    );

    return () => {
      socket?.off('new_group_chat');
      socket?.off('update_conversation');
    };
  }, [socket, queryClient, userProfile]);

  return (
    <MainContext.Provider
      value={{
        userProfile,
        conversations,
        dispatchConversations,
        contacts,
        dispatchContacts
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainProvider;
