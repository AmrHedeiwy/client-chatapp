'use client';

import { useContext } from 'react';
import { SocketContext } from '../components/provider/SocketProvider';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket() must be used within an SocketProvider');
  }
  return context;
};
