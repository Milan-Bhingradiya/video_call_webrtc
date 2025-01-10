"use client";
import { useRouter } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/providers/SocketContext";
import { Users, Video } from "lucide-react";

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Join Video Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-200"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="roomNumber"
                  className="text-sm font-medium text-gray-200"
                >
                  Room Number
                </Label>
                <Input
                  id="roomNumber"
                  placeholder="Enter room number"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Join Room
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center">
            <Video className="w-4 h-4 mr-1" />
            <span>Secure Video</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>Multiple Participants</span>
          </div>
        </div>
      </div>
    </div>
  );
}
