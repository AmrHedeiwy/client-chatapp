import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useModal, useSheet } from '@/hooks/useUI';
import Avatar from '../Avatar';
import {
  LogOut,
  MoreVertical,
  Pen,
  Trash2,
  UserRoundPlus,
  ChevronDown,
  ShieldAlert,
  UserRoundMinus,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Member } from '@/types';
import { useMain } from '@/hooks/useMain';
import { cn, toast } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Fragment, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import FileUpload from '../FileUpload';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import axios, { AxiosRequestConfig } from 'axios';
import Select from '../ui/select';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';
import { FormErrorProps } from '@/types/Axios';

const isFileBlob = (value: unknown): value is Blob & File =>
  value instanceof Blob && value instanceof File;

const ConversationSheet = () => {
  const { isOpen, type, data, onClose } = useSheet();
  const { onOpen } = useModal();
  const router = useRouter();
  const { userProfile, conversations, contacts, dispatchConversations } = useMain();
  const { onlineSockets } = useSocket();
  const [edit, setEdit] = useState<{
    isEditing: boolean;
    field: 'file' | 'name' | 'memberIds' | null;
    action: 'changeName' | 'addMembers' | 'changeImage' | null;
  }>({
    isEditing: false,
    field: null,
    action: null
  });

  const formSchema = z.object({
    name: z
      .string()
      .refine((value) => edit.field !== 'name' || value.length > 1, {
        message: 'The conversation name must be at least 2 characters long.'
      })
      .optional(),
    file: z.custom<(Blob & File) | undefined>(
      (value) => edit.field !== 'file' || isFileBlob(value),
      { message: 'Please add a image.' }
    ),
    memberIds: z
      .array(z.string())
      .refine(
        (value) => {
          console.log(value.length >= 1);
          return edit.field !== 'memberIds' || value.length > 0;
        },
        {
          message: 'At least one member is required to initiate conversation.'
        }
      )
      .optional()
  });

  const conversation = useMemo(() => {
    if (!conversations || !data || !data.conversationProfile) return null;

    return conversations[data.conversationProfile.conversationId];
  }, [conversations, data]);

  const filteredContactsArray = useMemo(() => {
    if (!contacts || !conversation) return null;

    return Object.values(contacts).filter((contact) => {
      const isExistingMember = conversation.otherMembers?.find(
        (member) => member.userId === contact.userId
      );

      return !isExistingMember;
    });
  }, [contacts, conversation]);

  const statusText = useMemo(() => {
    if (conversation?.isGroup) return conversation.members.length + ' members';

    const otherUserId = conversation?.otherMember?.userId as string;
    return onlineSockets.includes(otherUserId) ? 'online' : 'offline';
  }, [conversation, onlineSockets]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      file: undefined,
      memberIds: []
    }
  });

  const handleCloseForm = () => {
    if (!!edit.field) form.setValue(edit.field, undefined);
    setEdit({ isEditing: false, field: null, action: null });
  };

  const handleCloseSheet = () => {
    handleCloseForm();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { file, memberIds, name } = values;

    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': !!file ? 'multipart/form-data' : 'application/json' },
      withCredentials: true
    };
    try {
      if (edit.field === 'file' && !!file) {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/group/image`;
        const formData = new FormData();

        formData.append('file', file);
        formData.append('conversationId', conversationId);

        await axios.post(url, formData, config);
      }

      if (edit.field === 'name') {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/group/name`;

        await axios.patch(url, { conversationId, name }, config);

        dispatchConversations({
          type: 'update',
          payload: { updateInfo: { conversationId, field: 'name', data: { name } } }
        });
      }

      if (edit.field === 'memberIds') {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/group/members`;

        const res = await axios.post(url, { conversationId, memberIds }, config);

        dispatchConversations({
          type: 'update',
          payload: {
            updateInfo: {
              conversationId,
              field: 'members',
              action: 'addMembers',
              data: { members: res.data.newMembers }
            }
          }
        });
      }

      handleCloseForm();
    } catch (e: any) {
      const error = e.response.data.error;
      if (error && error.name === 'JoiValidationError') {
        (error.message as FormErrorProps[]).forEach(({ fieldName, fieldMessage }) => {
          // @ts-ignore
          form.setError(fieldName, { message: fieldMessage });
        });
      } else {
        toast('error', error.message);
      }

      if (error.redirect) router.push(error.redirect);
    }
  };

  const isSheetOpen = isOpen && type === 'conversationProfile';

  if (!conversation) return null;

  const {
    conversationId,
    name,
    image,
    isGroup,
    otherMember,
    adminIds,
    members,
    createdAt,
    createdBy
  } = conversation;

  const isCurrentUserAdmin =
    isGroup && adminIds ? adminIds.includes(userProfile.userId) : false;
  const isCurrentUserGroupCreator = isGroup ? createdBy === userProfile.userId : false;

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
      <SheetContent>
        {edit.isEditing && (
          <>
            <ArrowLeft
              className="text-slate-600 dark:text-slate-100 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition"
              onClick={() => handleCloseForm()}
            />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="my-10">
                <div className="flex items-center justify-center text-center">
                  {edit.field === 'file' && (
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center gap-y-2 justify-center">
                          <FormControl>
                            <FileUpload
                              value={field.value}
                              onChange={field.onChange}
                              isModalOpen={isOpen}
                              setError={form.setError}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                {edit.field === 'name' && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold">
                          name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter group name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {edit.field === 'memberIds' && (
                  <FormField
                    control={form.control}
                    name="memberIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Add members</FormLabel>
                        <FormControl>
                          <Select
                            disabled={field.disabled}
                            options={
                              filteredContactsArray
                                ? filteredContactsArray.map((contact) => ({
                                    value: contact.userId,
                                    label: contact.username
                                  }))
                                : undefined
                            }
                            onChange={(newValue, actionMeta) => {
                              if (actionMeta.action === 'select-option') {
                                // @ts-ignore
                                const value = newValue[newValue.length - 1].value;

                                if (typeof value !== 'string') return;

                                field.onChange([...(field.value || []), value]);
                              }

                              if (actionMeta.action === 'clear') field.onChange([]);

                              if (actionMeta.action === 'remove-value') {
                                const filterdValues = field.value?.filter(
                                  // @ts-expect-error
                                  (value) => value !== actionMeta.removedValue.value
                                );
                                field.onChange(filterdValues);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button className="w-full mt-14" disabled={form.formState.isSubmitting}>
                  Save
                </Button>
              </form>
            </Form>
          </>
        )}
        {!edit.isEditing && isGroup && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical
                size={20}
                onClick={(e) => e.preventDefault()}
                className="text-slate-600 dark:text-slate-100 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex items-center gap-x-1 cursor-pointer"
                  onClick={() =>
                    setEdit({ isEditing: true, field: 'name', action: 'changeName' })
                  }
                >
                  Change group name
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-x-2 cursor-pointer"
                  onClick={() =>
                    setEdit({ isEditing: true, field: 'memberIds', action: 'addMembers' })
                  }
                >
                  <UserRoundPlus size={18} className="text-green-600" />
                  <p>Add members</p>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!edit.isEditing && (
          <div className="relative mt-6 flex-1 px-4 sm:px-6">
            <div className="flex flex-col items-center ">
              <button
                className="relative"
                type="button"
                onClick={() =>
                  setEdit({ isEditing: true, field: 'file', action: 'changeImage' })
                }
              >
                <Avatar
                  imageUrl={conversation.image}
                  custom={cn(
                    'lg:w-24 lg:h-24 w-24 h-24',
                    isGroup && isCurrentUserAdmin && 'hover:opacity-60 cursor-pointer'
                  )}
                />
                {isGroup && isCurrentUserAdmin && (
                  <span className="bg-zinc-200 dark:bg-zinc-600 p-1 rounded-full absolute top-0 right-0 shadow-sm">
                    <Pen className="h-4 w-4" />
                  </span>
                )}
              </button>
              <div>{name}</div>
              <div className="text-sm text-gray-500">{statusText}</div>
              <div className="flex gap-x-3 my-10">
                <div
                  onClick={() =>
                    !isGroup || isCurrentUserGroupCreator
                      ? onOpen('deleteConversation', {
                          conversation: {
                            name: conversation.name,
                            isGroup
                          }
                        })
                      : onOpen('removeConversation', {
                          conversation: {
                            memberId: userProfile.userId,
                            name: conversation.name
                          }
                        })
                  }
                  className="flex flex-col items-center text-red-600 dark:text-red-700 cursor-pointer hover:opacity-75"
                >
                  <div className="w-10 h-10 bg-background/90 rounded-full flex items-center justify-center">
                    {(!isGroup || isCurrentUserGroupCreator) && (
                      <Trash2 className="lg:w-8 w-4" />
                    )}
                    {isGroup && !isCurrentUserGroupCreator && (
                      <LogOut className="lg:w-5 w-4" />
                    )}
                  </div>
                  <div className="text-sm ">
                    {!isGroup || isCurrentUserGroupCreator ? 'Delete' : 'Leave'}
                  </div>
                </div>
              </div>
              {isGroup && (
                <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
                  {(members as Member[]).map((member, i) => {
                    const isMemberCurrentUser = member.userId === userProfile.userId;
                    const isOtherMemberAdmin =
                      !isMemberCurrentUser && adminIds?.includes(member.userId);
                    return (
                      <Fragment key={i}>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-x-2 items-start p-2">
                            {<Avatar imageUrl={member.profile.image} />}
                            <div className="flex flex-col gap-y-1">
                              <p className="font-semibold text-sm">
                                {userProfile.userId !== member.userId
                                  ? member.profile.username
                                  : 'You'}
                              </p>

                              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                {'Joined at ' +
                                  format(new Date(member.joinedAt), 'dd MMM yyy')}
                              </p>
                            </div>
                          </div>

                          {isCurrentUserAdmin &&
                            !isMemberCurrentUser &&
                            (!isOtherMemberAdmin || isCurrentUserGroupCreator) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <ChevronDown
                                    size={18}
                                    className="text-slate-600 dark:text-slate-100 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition"
                                  />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom">
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      className="flex items-center gap-x-1 cursor-pointer"
                                      onClick={() =>
                                        onOpen('confirmAdminStatus', {
                                          adminStatus: {
                                            setStatus: isOtherMemberAdmin
                                              ? 'demote'
                                              : 'promote',
                                            memberId: member.userId,
                                            username: member.profile.username
                                          }
                                        })
                                      }
                                    >
                                      <ShieldAlert size={18} className="text-red-600 " />
                                      <p>
                                        {isOtherMemberAdmin
                                          ? 'Demote to member'
                                          : 'Promote to admin'}
                                      </p>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="flex items-center gap-x-2 cursor-pointer"
                                      onClick={() =>
                                        onOpen('removeMember', {
                                          member: {
                                            username: member.profile.username,
                                            userId: member.userId
                                          }
                                        })
                                      }
                                    >
                                      <UserRoundMinus
                                        size={18}
                                        className="text-red-700 dark:text-red-800"
                                      />
                                      <p>Remove</p>
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              )}

              {isGroup && (
                <p className="lg:text-sm text-xs text-zinc-400 dark:text-zinc-300">
                  Created at {format(new Date(createdAt as string), 'dd/MM/yyy')}
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ConversationSheet;
