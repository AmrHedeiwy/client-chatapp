'use client';

import React, { Dispatch, useEffect, useReducer } from 'react';
import { createContext, useState } from 'react';
import {
  Conversation,
  CurrentUser,
  GroupedContacts,
  GroupedConversations,
  User
} from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

type MainContextType = {
  userProfile: CurrentUser;
  conversations: GroupedConversations | null;
  dispatchConversations: Dispatch<conversationActionType>;
  contacts: GroupedContacts | null;
  dispatchContacts: Dispatch<contactActionType>;
};

type SocketProviderProps = {
  intialConversations: GroupedConversations | null;
  intialContacts: GroupedContacts | null;
  currentUserProfile: CurrentUser;
  children: React.ReactNode;
};
export const MainContext = createContext<MainContextType | undefined>(undefined);

type conversationActionType = {
  type: 'move' | 'add' | 'update' | 'remove';
  payload: {
    addInfo?: { conversation: Conversation; initMessages: boolean };
    moveInfo?: { conversationId: string };
    updateInfo?: { conversationId: string; data: any };
    removeInfo?: { conversationId: string };
  };
};
type contactActionType = {
  type: 'add' | 'update' | 'remove' | null;
  payload: any;
};

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

  function conversationsReducer(
    conversations: GroupedConversations | null,
    action: conversationActionType
  ) {
    const { addInfo, moveInfo, updateInfo } = action.payload;

    switch (action.type) {
      case 'add':
        if (!addInfo || !addInfo.conversation) return conversations;

        const { conversation, initMessages } = addInfo;

        // Initialize the messages for the conversation in the user's cache
        if (initMessages) {
          queryClient.setQueryData(['messages', conversation.conversationId], {
            pages: [{ items: [], nextPage: 0 }],
            pageParams: 0,
            unseenMessagesCount: 0
          });
        }

        if (!conversations || !conversations[conversation.conversationId]) {
          return { [conversation.conversationId]: conversation, ...conversations };
        }
        return conversations;
      case 'move':
        if (!conversations || !moveInfo) return conversations;

        const { conversationId } = moveInfo;

        if (!conversations[conversationId]) return conversations;

        const moveConversation = conversations[conversationId];

        return { [moveConversation.conversationId]: moveConversation, ...conversations };
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

  const [userProfile, setUserProfile] = useState<CurrentUser>(currentUserProfile);
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
        payload: { addInfo: { conversation: data.conversation, initMessages: true } }
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
