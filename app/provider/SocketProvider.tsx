'use client';

import { createContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
  onlineUsers: string[];
};

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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

    socketInstance.on('connected', (status: string, userIds: string[]) => {
      if (status) {
        setOnlineUsers((prev) => {
          return [...prev, ...userIds];
        });
      } else
        setOnlineUsers((prev) => {
          return prev.filter((userId) => !prev?.includes(userId));
        });
    });

    setSocket(socketInstance);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        const timeOut = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            socketInstance.disconnect();
          }
          clearTimeout(timeOut);
        }, 1000 * 30);
      } else {
        if (socketInstance.disconnected) socketInstance.connect();
      }
    }

    return () => {
      socketInstance.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
