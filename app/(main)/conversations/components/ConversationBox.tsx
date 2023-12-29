import Avatar from '@/app/components/Avatar';
import useOtherUser from '@/app/hooks/useOtherUser';
import { useSession } from '@/app/hooks/useSession';
import { Conversation, User } from '@/app/types';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

interface ConversationBoxProps {
  data: Conversation;
  selected: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({ data, selected }) => {
  const router = useRouter();
  const session = useSession();
  const otherUser = !data.IsGroup ? useOtherUser(data.Users as User[]) : null;

  const handleClick = useCallback(() => {
    router.push(`/conversations/${data.ConversationID}`);
  }, [data.ConversationID, router]);

  const lastMessage = useMemo(() => {
    const messages = data.Messages || [];

    return messages[messages.length - 1];
  }, [data.Messages]);

  const userUserID = useMemo(() => session?.user?.UserID, [session.user?.UserID]);

  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      return false;
    }

    const seenArray = lastMessage.SeenUsers || [];

    if (!userUserID) {
      return false;
    }

    return seenArray.filter((user: User) => user.UserID === userUserID).length !== 0;
  }, [userUserID, lastMessage]);

  const lastMessageText = useMemo(() => {
    if (lastMessage?.Image) {
      return 'Sent an image';
    }

    if (lastMessage?.Body) {
      return lastMessage?.Body;
    }

    return 'Started a conversation';
  }, [lastMessage]);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        `
        w-full 
        relative 
        flex 
        items-center 
        space-x-3 
        rounded-lg
        cursor-pointer
        p-4
        hover:border
        hover:bg-slate-100`,
        selected ? 'bg-slate-100' : 'bg-white'
      )}
    >
      {data.IsGroup ? (
        'Grouped Avatar (Implement later)'
      ) : (
        <Avatar user={otherUser as User} withStatus />
      )}
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <div className="flex justify-between items-center mb-1">
            <p
              className={clsx(
                `text-md font-medium text-gray-900`,
                !otherUser && 'skeleton h-4 w-20'
              )}
            >
              {data.Name || otherUser?.Username}
            </p>

            {lastMessage?.CreatedAt && (
              <p
                className="
                  text-xs 
                  text-gray-400 
                  font-light
                "
              >
                {format(new Date(lastMessage.CreatedAt), 'p')}
              </p>
            )}
          </div>
          <p
            className={clsx(
              `
              truncate 
              text-sm
              `,
              hasSeen ? 'text-gray-500' : 'text-black font-medium',
              !data.IsGroup && !otherUser && 'skeleton h-4 w-11/12'
            )}
          >
            {(data.IsGroup || otherUser) && lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
