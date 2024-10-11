"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import io from "socket.io-client";

// Define the context type
// interface SocketContextType {
//   socket: SocketIOClient.Socket;
// }

// Create the socket context
export const socketContext = createContext<any>(null);

export const useSocket = () => {
  const socket = useContext(socketContext);
  return socket.socket;
};

interface Props {
  children: ReactNode;
}

export const SocketDataProvider = ({ children }: Props) => {
  const socket = useMemo(() => {
    return io.connect("http://localhost:8001");
  }, []);

  return (
    <socketContext.Provider value={{ socket }}>
      {children}
    </socketContext.Provider>
  );
};
