'use client';

import SearchBarInput from '@/components/SeachBarInput';
import { useRef, useState } from 'react';
import SearchList from './SearchList';
import { useInfiniteQuery } from '@tanstack/react-query';
import useConversationParams from '@/hooks/useConversationParams';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleUserRound, UserRoundSearch } from 'lucide-react';
import ContactList from './ContactList';

const ContactForm = () => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen } = useConversationParams();

  const fetchUsers = async ({ pageParam = 0, searchQuery = '' }) => {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/contacts/search?search=${searchQuery}&page=${pageParam}`;
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
      className={cn(
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

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="w-full justify-evenly bg-transparent">
          <TabsTrigger
            className="w-full gap-x-2 focus-within:dark:bg-zinc-900"
            value="search"
          >
            <UserRoundSearch />
            Search
          </TabsTrigger>
          <TabsTrigger
            className="w-full gap-x-2 focus-within:dark:bg-zinc-900"
            value="contacts"
          >
            <CircleUserRound />
            Contacts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <SearchList
            searchQuery={inputRef.current?.value || ''}
            data={data}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isError={isError}
          />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactList />
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default ContactForm;
