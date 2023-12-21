'use client';

import { useMemo } from 'react';
import { User } from '../types/index';
import { useSession } from './useSession';

const useOtherUser = (users: User[]) => {
  const session = useSession();

  const otherUser = useMemo(() => {
    const currentUserID = session.user?.UserID;

    if (!currentUserID) return;

    const otherUser = users.filter((user) => user.UserID !== currentUserID);

    return otherUser[0];
  }, [session.user?.UserID, users]);

  return otherUser;
};

export default useOtherUser;
