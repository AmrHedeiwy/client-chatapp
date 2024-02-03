'use client';

import { createContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
  onlineUsers: string[];
};

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

type SocketProviderProps = {
  children: React.ReactNode;
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const router = useRouter();

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

    // document.addEventListener('visibilitychange', handleVisibilityChange);
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        const timeOut = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            socketInstance.disconnect();
          }
          if (document.visibilityState === 'visible' && !isConnected) {
            socketInstance.connect();
          }
          clearTimeout(timeOut);
        }, 1000 * 5);
      } else {
        if (!isConnected) {
          socketInstance.connect();
          router.refresh();
        }
      }
    }

    return () => {
      socketInstance.disconnect();
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
