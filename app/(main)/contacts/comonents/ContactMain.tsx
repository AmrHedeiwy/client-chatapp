'use client';

import SearchBarInput from '@/components/SeachBarInput';
import { useRef, useState } from 'react';
import UserList from './UserList';
import { useInfiniteQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import useConversationParams from '@/hooks/useConversationParams';

const ContactForm = () => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen } = useConversationParams();

  const fetchUsers = async ({ pageParam = 0, searchQuery = '' }) => {
    const url: string = `http://localhost:5000/contacts/search?search=${searchQuery}&page=${pageParam}`;
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };

    const res = await fetch(url, config);
    const data = await res.json();

    return data;
  };

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
    useInfiniteQuery({
      queryKey: ['search', inputRef.current?.value || ''],
      queryFn: ({ pageParam }) =>
        fetchUsers({ pageParam, searchQuery: inputRef.current?.value }),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      enabled: search.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
      initialPageParam: 0
    });

  return (
    <aside
      className={clsx(
        `
        fixed
        inset-y-0
        pb-20
        lg:pb-0
        lg:left-20
        lg:w-80
        lg:block 
      dark:bg-[#2B2D31] 
      bg-[#F2F3F5]`,
        isOpen ? 'hidden' : 'block w-full left-0'
      )}
    >
      <div className="px-3 mt-4 mb-6">
        <h2 className="w-full text-slate-900 tracking-widest dark:text-white text-xl flex items-center h-10 mb-2">
          Contacts
        </h2>
        <SearchBarInput
          inputRef={inputRef}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Seacrh here..."
        />
      </div>

      <UserList
        searchQuery={inputRef.current?.value || ''}
        data={data}
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
      />
    </aside>
  );
};

export default ContactForm;
