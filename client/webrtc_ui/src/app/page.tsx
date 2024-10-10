"use client";
import { useRouter } from "next/navigation";

import { useCallback, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { socketContext } from "@/providers/SocketContext";

export default function Page() {
  const [email, setEmail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const { socket, connectSocket } = useContext(socketContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the join room logic here
    console.log("Joining room:", { email, roomNumber });
    socket.emit("join-room", { emailId: email, roomId: roomNumber });
  };

  const router = useRouter();

  const handleJoinRoom = useCallback(
    ({ roomId }: { roomId: number }) => {
      router.push(`/room/${roomId}`);
    },
    [router]
  );

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);


  useEffect(() => {
    socket?.on("joined-room", handleJoinRoom);
    return () => {
      socket?.off("joined-room", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Room</CardTitle>
          <CardDescription>
            Enter your email and room number to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                type="text"
                placeholder="Enter room number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Join
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
