'use client';

import React, { Dispatch, SetStateAction, useEffect, useReducer } from 'react';
import { createContext, useState } from 'react';
import {
  Conversation,
  CurrentUser,
  GroupedContacts,
  GroupedConversations,
  Profile,
  Member
} from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/utils';

type MainContextType = {
  userProfile: CurrentUser;
  setUserProfile: Dispatch<SetStateAction<CurrentUser>>;
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
    updateInfo?: { conversationId: string; field: string; action?: string; data: any };
    removeInfo?: { conversationId: string };
  };
};
type contactActionType = {
  type: 'add' | 'update' | 'remove' | null;
  payload: {
    addInfo?: { contact: Profile };
    removeInfo?: { contactId: string };
    updateInfo?: { contactId: string; data: any };
  };
};

function contactsReducer(contacts: GroupedContacts | null, action: contactActionType) {
  const { addInfo, updateInfo, removeInfo } = action.payload;

  switch (action.type) {
    case 'add':
      if (!addInfo || !addInfo.contact) return contacts;

      const { contact } = addInfo;

      if (!contacts) return { [contact.userId]: contact };

      const addedContact = { ...contacts, [contact.userId]: contact };

      let contactsArray = Object.values(addedContact);
      contactsArray.sort(
        (contacta, contactb) =>
          parseInt(contacta.username.charAt(0)) - parseInt(contactb.username.charAt(0))
      );

      return contactsArray.reduce((acc: GroupedContacts, contact) => {
        acc[contact.userId] = contact;
        return acc;
      }, {});
    case 'update':
      if (!contacts || !updateInfo) return contacts;

      return {
        ...contacts,
        [updateInfo.contactId]: {
          ...contacts[updateInfo.contactId],
          ...updateInfo.data
        }
      };
    case 'remove':
      if (!contacts || !removeInfo) return contacts;

      const updatedContacts = { ...contacts };
      delete updatedContacts[removeInfo.contactId];

      return updatedContacts;
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
    const { addInfo, moveInfo, updateInfo, removeInfo } = action.payload;

    switch (action.type) {
      case 'add':
        if (!addInfo || !addInfo.conversation) return conversations;

        const { conversation: conversationToAdd, initMessages } = addInfo;

        // Initialize the messages for the conversation in the user's cache
        if (initMessages) {
          queryClient.setQueryData(['messages', conversationToAdd.conversationId], {
            pages: [{ items: [], nextPage: 0 }],
            pageParams: 0,
            unseenMessagesCount: 0
          });
        }

        if (!conversations || !conversations[conversationToAdd.conversationId]) {
          return {
            [conversationToAdd.conversationId]: conversationToAdd,
            ...conversations
          };
        }
        return conversations;
      case 'move':
        if (!conversations || !moveInfo) return conversations;

        if (!conversations[moveInfo.conversationId]) return conversations;

        const conversationToMove = conversations[moveInfo.conversationId];

        return {
          [conversationToMove.conversationId]: conversationToMove,
          ...conversations
        };
      case 'update':
        if (
          !updateInfo ||
          !conversations ||
          !conversations[updateInfo.conversationId] ||
          !updateInfo.data
        )
          return conversations;

        const { conversationId, field, action, data } = updateInfo;
        const conversation = conversations[conversationId];

        if (field === 'name' || field === 'image') {
          return {
            ...conversations,
            [conversationId]: {
              ...conversation,
              ...data
            }
          };
        }

        if (field === 'members') {
          if (action === 'addMembers')
            return {
              ...conversations,
              [conversationId]: {
                ...conversation,
                members: [...conversation.members, ...data.members],
                otherMembers: [...(conversation.otherMembers || []), ...data.members]
              }
            };

          if (action === 'removeMember')
            return {
              ...conversations,
              [conversationId]: {
                ...conversation,
                members: conversation.members.filter(
                  (member) => member.userId !== data.memberId
                ),
                otherMembers: conversation.otherMembers?.filter(
                  (member) => member.userId !== data.memberId
                ),
                adminIds: conversation.adminIds?.filter(
                  (adminId) => adminId !== data.memberId
                ) // remove the member from the admin list if it exits
              }
            };

          if (action === 'updateMemberProfile')
            return {
              ...conversations,
              [conversationId]: {
                ...conversation,
                members: conversation.members.map((member) => {
                  if (member.userId === data.userId) {
                    return {
                      ...member,
                      profile: {
                        ...member.profile,
                        ...data
                      }
                    };
                  }
                  return member;
                }),
                ...(conversation.isGroup
                  ? {
                      otherMembers: (conversation.otherMembers as Member[]).map(
                        (member) => {
                          if (member.userId === data.userId) {
                            return {
                              ...member,
                              profile: {
                                ...member.profile,
                                ...data
                              }
                            };
                          }
                          return member;
                        }
                      )
                    }
                  : {
                      otherMember: {
                        ...(conversation.otherMember as Member),
                        profile: {
                          ...(conversation.otherMember as Member).profile,
                          ...data
                        }
                      }
                    })
              }
            };
        }

        if (field === 'adminIds' && conversation.isGroup) {
          if (action === 'promote')
            return {
              ...conversations,
              [conversationId]: {
                ...conversation,
                adminIds: [...(conversation.adminIds as string[]), data.memberId]
              }
            };

          if (action === 'demote')
            return {
              ...conversations,
              [conversationId]: {
                ...conversation,
                adminIds: (conversation.adminIds as string[]).filter(
                  (adminId) => adminId !== data.memberId
                )
              }
            };
        }

        return conversations;
      case 'remove':
        if (!conversations || !removeInfo || !removeInfo.conversationId)
          return conversations;

        const updatedConversations = { ...conversations };
        delete updatedConversations[removeInfo.conversationId];

        return updatedConversations;
    }
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
      (updatedData: {
        conversationId: string;
        field: string;
        action: string;
        data: any;
      }) => {
        dispatchConversations({
          type: 'update',
          payload: { updateInfo: updatedData }
        });
      }
    );

    socket.on('remove_conversation', (data: { conversationId: string }) => {
      dispatchConversations({
        type: 'remove',
        payload: { removeInfo: { conversationId: data.conversationId } }
      });
    });

    socket.on(
      'update_user',
      (data: { userId: string; image?: string; name?: string }) => {
        const { userId, ...updatefields } = data;

        if (contacts && contacts[userId]) {
          dispatchContacts({
            type: 'update',
            payload: { updateInfo: { contactId: data.userId, data: updatefields } }
          });
        }

        if (!conversations) return;

        const conversationsArray = Object.values(conversations);
        conversationsArray.forEach((conversation: Conversation) => {
          const isMember = conversation.isGroup
            ? !!(conversation.otherMembers as Member[]).find(
                (member) => member.userId === userId
              )
            : (conversation.otherMember as Member).userId === userId;

          if (isMember) {
            dispatchConversations({
              type: 'update',
              payload: {
                updateInfo: {
                  conversationId: conversation.conversationId,
                  field: 'members',
                  action: 'updateMemberProfile',
                  data: updatefields
                }
              }
            });
          }
        });
      }
    );

    socket.on(
      'upload_fail',
      (data: {
        key: 'messageId' | 'conversationId' | 'userId';
        value: string;
        publisherId: string;
      }) => {
        if (data.key === 'conversationId') {
          dispatchConversations({
            type: 'update',
            payload: {
              updateInfo: {
                conversationId: data.value,
                field: 'image',
                data: { image: null }
              }
            }
          });

          if (data.publisherId === userProfile.userId)
            toast('error', 'Image failed to upload, please try again later.');
        }
      }
    );

    return () => {
      socket?.off('new_group_chat');
      socket?.off('update_conversation');
      socket?.off('remove_conversation');
      socket?.off('update_user');
      socket?.off('upload_fail');
    };
  }, [socket, queryClient, userProfile]);

  return (
    <MainContext.Provider
      value={{
        userProfile,
        setUserProfile,
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
