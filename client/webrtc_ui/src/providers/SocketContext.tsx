// "use client";
// import { createContext, ReactNode, useMemo } from "react";
// import io from "socket.io-client";
// interface SocketContextType {
//   socket: SocketIOClient.Socket;
// }

// export const socketContext = createContext<SocketContextType | null>(null);

// interface Props {
//   children: ReactNode;
// }
// export const SocketDataProvider = ({ children }: Props) => {
//   const socket = useMemo(() => {
//     return io.connect("http://localhost:8001");
//   }, []);

//   return (
//     <socketContext.Provider value={{ socket }}>
//       {children}
//     </socketContext.Provider>
//   );
// };

import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import { Socket } from "socket.io-client";

// Define the context type
interface SocketContextType {
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

// Create the socket context
export const socketContext = createContext<SocketContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const SocketDataProvider = ({ children }: Props) => {
  // // Ensure the socket connection is established only once
  // useEffect(() => {
  //   const newSocket = io("http://localhost:8001", {
  //     transports: ["websocket"],
  //     reconnectionAttempts: 5,
  //   });
  //   setSocket(newSocket);

  //   // Clean up the socket connection when the component unmounts
  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []); // Empty dependency array ensures this only runs once

  const [socket, setSocket] = useState<Socket | null>(null);

  const connectSocket = () => {
    console.log("connect socket calll");
    if (!socket) {
      console.log("connect socket calll2");
      const newSocket = io("http://localhost:8001", {
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

  return (
    <socketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </socketContext.Provider>
  );
};
