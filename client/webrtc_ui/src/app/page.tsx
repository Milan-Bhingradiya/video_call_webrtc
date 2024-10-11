"use client";
import { useRouter } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
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
import { useSocket } from "@/providers/SocketContext";

export default function Page() {
  const [email, setEmail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const socket = useSocket();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      alert("form submiitt");
      // Handle the join room logic here
      console.log("Joining room:", { email, roomNumber });
      socket.emit("room:join", { emailId: email, roomId: roomNumber });
    },
    [email, roomNumber, socket]
  );

  const router = useRouter();

  const handleJoinRoom = useCallback(
    ({ roomId }: { roomId: number }) => {
      alert("call for join room");
      router.push(`/room/${roomId}`);
    },
    [router]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket?.off("room:join", handleJoinRoom);
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
            <Button onClick={handleSubmit}>Join</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
