'use client';

import { useRef } from 'react';

const Body = () => {
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="pt-24" ref={bottomRef} />
    </div>
  );
};

export default Body;
