import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const connectSocket = () => {
    console.log("connect socket calll");
    if (!socket) {
      console.log("connect socket calll2");
      const newSocket = io(url, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });
      setSocket(newSocket);
    }
  };

  const disconnectSocket = () => {
    console.log("disconect calllll");
    if (socket) {
      console.log("disconect calllll2");
      socket.disconnect();
      setSocket(null);
    }
  };

  //   useEffect(() => {
  //     return () => {
  //       disconnectSocket(); // Cleanup on unmount
  //     };
  //   }, [socket]);

  return { socket, connectSocket, disconnectSocket };
};
