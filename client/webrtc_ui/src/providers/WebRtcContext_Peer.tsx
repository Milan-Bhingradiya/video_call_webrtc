"use client";
import { createContext, useEffect, useState } from "react";

interface WebRtcContext_PeerType {
  peer: RTCPeerConnection | null; // May be null if WebRTC is not supported
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit | null>;
  setRemoteAns: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendStream: (stream: MediaStream) => Promise<void>;
  remoteMediaStream: MediaStream | null;
}

export const WebRtcContext_Peer = createContext<WebRtcContext_PeerType | null>(
  null
);

export const WebRtcContext_Peer_provider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

  const [remoteMediaStream, setremoteMediaStream] =
    useState<MediaStream | null>(null);

  const createPeerConnection = () => {
    if (
      typeof window !== "undefined" &&
      typeof RTCPeerConnection !== "undefined"
    ) {
      let peerConnection = null;

      if (peerConnection == null) {
        try {
          peerConnection = new RTCPeerConnection({
            iceServers: [
              {
                urls: ["stun:stun.l.google.com:19302"], // Google STUN server
              },
            ],
          });
        } catch (error) {
          console.log("Error creating peer connection: ");
          console.log("Error creating peer connection: ");
          console.error("Error creating peer connection: ", error);
          return null;
        }
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("New ICE candidate: ", event.candidate);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state: ", peerConnection.connectionState);
        if (peerConnection.connectionState === "closed") {
          setPeer(null); // Reset peer when it's closed
        }
      };

      return peerConnection;
    } else {
      console.error("WebRTC is not supported in this environment.");
      return null;
    }
  };

  useEffect(() => {
    // Initialize the peer connection when the component mounts
    setPeer(createPeerConnection());

    // Cleanup when the component unmounts
    return () => {
      if (peer) {
        peer.close();
        setPeer(null);
      }
    };
  }, []);

  const createOffer = async (): Promise<RTCSessionDescriptionInit | null> => {
    try {
      if (!peer || peer.signalingState === "closed") {
        console.warn(
          "Peer connection is closed or not initialized, creating a new one."
        );
        setPeer(createPeerConnection());
      }

      if (peer) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
      } else {
        throw new Error("Peer connection not available");
      }
    } catch (error) {
      console.error("Error creating offer: ", error);
      return null;
    }
  };

  const createAnswer = async (
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | null> => {
    try {
      if (!peer || peer.signalingState === "closed") {
        console.log(
          "Peer connection is closed or not initialized, creating a new one."
        );
        setPeer(createPeerConnection());
      }

      await peer!.setRemoteDescription(offer);
      const answer = await peer!.createAnswer();
      await peer!.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer: ", error);
      return null;
    }
  };

  const setRemoteAns = async (answer: RTCSessionDescriptionInit) => {
    try {
      if (!peer || peer.signalingState === "closed") {
        console.warn(
          "Peer connection is closed or not initialized, creating a new one."
        );
        setPeer(createPeerConnection());
      }

      if (peer) {
        await peer.setRemoteDescription(answer);
      } else {
        throw new Error("Peer connection not available");
      }
    } catch (error) {
      console.error("Error setting remote answer: ", error);
    }
  };

  const sendStream = async (stream: MediaStream) => {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      peer?.addTrack(track, stream);
    });
  };

  const handleTrackEvent = async (event: RTCTrackEvent) => {
    const st = event.streams[0];
    setremoteMediaStream(st);
    console.log("remote media :", st);
    console.log(event.streams[0]);
  };

  useEffect(() => {
    peer?.addEventListener("track", handleTrackEvent);
    return () => {
      peer?.removeEventListener("track", handleTrackEvent);
    };
  }, [peer]);

  useEffect(() => {
    if (remoteMediaStream) {
      console.log("Updated remoteMediaStream:", remoteMediaStream);
      // You can perform actions with the updated stream here
    }
  }, [remoteMediaStream]); // This will trigger every time remoteMediaStream updates

  return (
    <WebRtcContext_Peer.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        remoteMediaStream,
      }}
    >
      {children}
    </WebRtcContext_Peer.Provider>
  );
};
