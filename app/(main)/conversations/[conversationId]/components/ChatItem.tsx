'use client';

import { useRouter, useParams } from 'next/navigation';
import { User } from '@/app/types';
import Avatar from '@/app/components/Avatar';
import { useEffect } from 'react';

interface ChatItemProps {
  id: string;
  content: string;
  sender: User;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  isGroup: boolean;
  groupCreatedBy: string | undefined;
}

export const ChatItem = ({
  id,
  content,
  sender,
  timestamp,
  fileUrl,
  deleted,
  isGroup,
  groupCreatedBy
}: ChatItemProps) => {
  const params = useParams();
  const router = useRouter();

  const isAdmin = isGroup && sender.userId === groupCreatedBy;

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <Avatar user={sender} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm text-black hover:underline cursor-pointer">
                {sender.username}
              </p>
            </div>
            <span className="text-xs text-zinc-500">{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
