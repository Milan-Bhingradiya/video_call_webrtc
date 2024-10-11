"use client";
import peerServiceInstance from "@/app/service/peer";
import { useSocket } from "@/providers/SocketContext";
import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

function Page({ params }: { params: { roomId: number } }) {
  const [myMediaStream, setmyMediaStream] = useState<MediaStream | null>(null);
  const [remoteMediaStream, setremotemyMediaStream] =
    useState<MediaStream | null>(null);
  const [remoteSocketId, setremoteSocketId] = useState<string>("");

  // Define socket and WebRTC variables
  const socket = useSocket();

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // make my offer and send to reciver with reciver socketid
    const offer = await peerServiceInstance.getOffer();
    socket.emit("call:user", { to: remoteSocketId, offer: offer });
    setmyMediaStream(stream);
  }, [remoteSocketId, socket]);

  // Handle a new user joining the room
  const handleNewUserJoined = useCallback(
    async (data: { emailId: string; id: string }) => {
      console.log("New user joined in room:", data.emailId);
      setremoteSocketId(data.id);
    },
    [] // Dependencies
  );

  const handleIncomingCall = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log("incoming call from ", data.from, "offer : ", data);
      setremoteSocketId(data.from);

      // kok no call ave etle apdo camero start....

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setmyMediaStream(stream);

      const answer = await peerServiceInstance.getAnswer(data.offer);
      socket.emit("call:accepted", { to: data.from, answer: answer });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      peerServiceInstance.setlocalDescription(data.answer);
      console.log("call accepted from ", data.from);

      // this mystram to another user...
      for (const track of myMediaStream!.getTracks()) {
        peerServiceInstance.peer.addTrack(track, myMediaStream!);
      }
    },
    [myMediaStream]
  );

  const handleNegotiationIncoming = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log("Negotiation needed from ", data.from);

      const answer = await peerServiceInstance.getAnswer(data.offer);
      socket.emit("peer:nego:done", { to: data.from, answer: answer });
    },
    [socket]
  );

  const handleNegotiationFinal = useCallback(
    async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      console.log("Negotiation final from ", data.from);
      peerServiceInstance.setlocalDescription(data.answer);
    },
    []
  );

  // Listen for 'user-joined' event and handle it
  useEffect(() => {
    socket?.on("user:joined", handleNewUserJoined);
    socket?.on("incomming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegotiationIncoming);
    socket.on("peer:nego:final", handleNegotiationFinal);

    return () => {
      socket?.off("user:joined", handleNewUserJoined); // Cleanup on component unmount
      socket.off("incomming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegotiationIncoming);
      socket.off("peer:nego:final", handleNegotiationFinal);
    };
  }, [handleCallAccepted, handleIncomingCall, handleNewUserJoined, socket]); // Dependencies

  const handleGetRemoteDataStream = useCallback((event: any) => {
    const remotestream = event.streams[0];
    setremotemyMediaStream(remotestream);
  }, []);
  useEffect(() => {
    peerServiceInstance.peer.addEventListener(
      "track",
      handleGetRemoteDataStream
    );

    return () => {
      peerServiceInstance.peer.removeEventListener(
        "track",
        handleGetRemoteDataStream
      );
    };
  }, [handleGetRemoteDataStream]);

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peerServiceInstance.getOffer();
    socket.emit("peer:nego:needed", { to: remoteSocketId, offer: offer });
  }, [remoteSocketId, socket]);
  useEffect(() => {
    peerServiceInstance.peer.addEventListener(
      "negotiationneeded",
      handleNegotiationNeeded
    );

    return () => {
      peerServiceInstance.peer.removeEventListener(
        "peer:nego:needed",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  return (
    <div>
      <h1>You are in room number {params.roomId}</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {remoteSocketId && (
        <button
          onClick={() => {
            handleCallUser();
          }}
        >
          Call
        </button>
      )}

      {myMediaStream && <ReactPlayer url={myMediaStream} playing />}
      {remoteMediaStream && <ReactPlayer url={remoteMediaStream} playing />}
    </div>
  );
}

export default Page;
