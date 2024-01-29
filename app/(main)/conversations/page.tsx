'use client';

import clsx from 'clsx';

import useConversationParams from '@/app/hooks/useConversationParams';
import EmptyState from '@/app/components/EmptyState';

const Home = () => {
  const { isOpen } = useConversationParams();
  return (
    <div className={clsx('lg:pl-80 h-full lg:block', isOpen ? 'block' : 'hidden')}>
      <EmptyState />
    </div>
  );
};

export default Home;
