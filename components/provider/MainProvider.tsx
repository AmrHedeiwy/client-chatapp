'use client';

import React, { Dispatch, useReducer } from 'react';
import { createContext, useState } from 'react';
import { Conversation, GroupedContacts, GroupedConversations, User } from '@/types';

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
  payload: any;
};
type contactActionType = {
  type: 'add' | 'update' | 'remove' | null;
  payload: any;
};

function conversationsReducer(
  conversations: GroupedConversations | null,
  action: conversationActionType
) {
  let conversation = action.payload.conversation as Conversation;

  switch (action.type) {
    case 'add':
      if (!conversations || !conversations[conversation.conversationId]) {
        return { [conversation.conversationId]: conversation, ...conversations };
      }
      return conversations;
    case 'move':
      if (!conversations) return { [conversation.conversationId]: conversation };

      delete conversations[conversation.conversationId];
      return { [conversation.conversationId]: conversation, ...conversations };
    case 'update':
      break;
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
  const [userProfile, setUserProfile] = useState(currentUserProfile);
  const [conversations, dispatchConversations] = useReducer(
    conversationsReducer,
    intialConversations
  );

  const [contacts, dispatchContacts] = useReducer(contactsReducer, intialContacts);

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
