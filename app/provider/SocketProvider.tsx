'use client';

import { createContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = new (io as any)('http://localhost:5000', {
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
