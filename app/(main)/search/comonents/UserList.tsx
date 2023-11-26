'use client';

import { User } from '@/app/types/User';
import React, { ElementRef, Fragment, useEffect, useRef } from 'react';
import UserBox from './UserBox';
import { InfiniteData, InfiniteQueryObserverResult } from '@tanstack/react-query';
import { BsCircleFill, BsExclamationCircle } from 'react-icons/bs';
import Link from '@/app/components/Link';

interface UserListProps {
  searchQuery: string;
  data: InfiniteData<any> | undefined;
  isFetching: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => Promise<InfiniteQueryObserverResult<any, unknown>>;
  isFetchingNextPage: boolean;
  isError: boolean;
}

const UserList: React.FC<UserListProps> = ({
  searchQuery,
  data,
  isFetching,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isError
}) => {
  const topRef = useRef<ElementRef<'div'>>(null);

  const calculateMaxScrollHeight = () => {
    const windowHeight = window?.innerHeight;
    const screenWidth = window.screen.width;
    const topRefOffset = topRef?.current?.offsetTop;

    if (!topRefOffset) return;

    const maxHeight = windowHeight - topRefOffset - (screenWidth < 1024 ? 50 : 0);

    topRef.current.style.maxHeight = `${maxHeight}px`;
  };

  useEffect(() => {
    const topDiv = topRef?.current;

    const handleScroll = () => {
      if (!topDiv) return;
      const distanceFromBottom =
        topDiv?.scrollHeight - topDiv?.scrollTop - topDiv?.clientHeight;

      if (distanceFromBottom === 0 && !isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    };

    topDiv?.addEventListener('scroll', handleScroll);
    window?.addEventListener('resize', calculateMaxScrollHeight);

    return () => {
      topDiv?.removeEventListener('scroll', handleScroll);
      window?.removeEventListener('resize', calculateMaxScrollHeight);
    };
  }, [hasNextPage, fetchNextPage, topRef]);

  useEffect(() => calculateMaxScrollHeight, []);

  return (
    <div ref={topRef} className="overflow-y-auto scrollable-content px-2">
      {data?.pages.map((group, i) => {
        return (
          <Fragment key={i}>
            {!!group?.users ? (
              (group.users as User[]).map((user, i) => {
                return (
                  <Fragment key={i}>
                    <UserBox data={user} />
                  </Fragment>
                );
              })
            ) : (
              <p className="flex justify-center items-center text-xs my-4">
                No users found
              </p>
            )}
          </Fragment>
        );
      })}

      {isFetching && !isFetchingNextPage && (
        <div className="flex flex-col flex-1 justify-center items-center">
          <BsCircleFill className="h-4 w-4 text-gray-400 animate-ping my-4" />
          <p className="text-xs text-blue-400">Searching for {searchQuery}...</p>
        </div>
      )}

      {!!hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <BsCircleFill className="h-4 w-4 text-gray-400 animate-ping my-4 mx-1" />
          ) : (
            <Link onClick={() => fetchNextPage()} withButton>
              Load more
            </Link>
          )}
        </div>
      )}

      {isError && (
        <div className="flex flex-col flex-1 justify-center items-center">
          <BsExclamationCircle className="h-6 w-6 text-rose-400 my-4" />
          <p className="text-xs text-rose-400">Somthing went wrong!</p>
        </div>
      )}
    </div>
  );
};

export default UserList;
