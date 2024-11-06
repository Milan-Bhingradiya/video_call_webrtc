"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import io from "socket.io-client";

// Define the context type
interface SocketContextType {
  socket: SocketIOClient.Socket;
}

// Create the socket context
export const socketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const socket = useContext(socketContext) as SocketContextType;
  return socket.socket;
};

interface Props {
  children: ReactNode;
}

export const SocketDataProvider = ({ children }: Props) => {
  const socket = useMemo(() => {
    // return io.connect("https://videocallwebrtc-production.up.railway.app");
    return io.connect(
      "https://webrtc-roomvideo-app-48c8cc957d67.herokuapp.com/"
    );
  }, []);

  return (
    <socketContext.Provider value={{ socket }}>
      {children}
    </socketContext.Provider>
  );
};
