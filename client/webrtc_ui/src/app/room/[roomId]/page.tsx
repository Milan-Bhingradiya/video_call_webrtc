"use client";
import { socketContext } from "@/providers/SocketContext";
import { WebRtcContext_Peer } from "@/providers/WebRtcContext_Peer";
import React, {
  use,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ReactPlayer from "react-player";

function Page({ params }: { params: { roomId: number } }) {
  const [myMediaStream, setmyMediaStream] = useState<MediaStream | null>(null);
  const [remoteEmailId, setremoteEmailId] = useState<string>("");
  const socketCtx = useContext(socketContext); // Using Socket.io context
  const WebRtcCtx = useContext(WebRtcContext_Peer); // Using WebRTC context

  // Define socket and WebRTC variables
  const socket = socketCtx?.socket;
  const {
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteMediaStream,
    peer,
  } = WebRtcCtx || {};

  // Handle a new user joining the room
  const handleNewUserJoined = useCallback(
    async (data: { emailId: string }) => {
      console.log("New user joined in room:", data.emailId);

      try {
        if (createOffer) {
          const offer = await createOffer(); // Use the WebRTC offer
          try {
            setTimeout(() => {
              socket?.emit("call-user", { emailId: data.emailId, offer }); // Example event to send the offer
            }, 1000);

            setremoteEmailId(data.emailId);
          } catch (error) {
            console.error("Error calling user:", error);
          }
        }
      } catch (error) {
        console.error("Error creating WebRTC offer:", error);
      }
    },
    [createOffer, socket] // Dependencies
  );

  const handleIncomingCall = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log("incoming call : ", data.from, " offer : ", data.offer);

      try {
        if (createAnswer) {
          const ans = await createAnswer(data.offer);
          console.log("ans from user 2 to 1: ", ans);
          // je mane call karto to eni email and maro ip data in ans
          socket?.emit("call-accepted", { emailId: data.from, answer: ans });
        } else {
          console.error("createAnswer is undefined");
        }
      } catch (error) {
        console.error("Error creating WebRTC answer:", error);
      }
    },
    [createAnswer, socket]
  );

  // when call accpeted set remote data ....
  const handleAnswerCall = useCallback(
    async (data: { answer: RTCSessionDescriptionInit }) => {
      console.log(
        "now user 1 saveing user 2 data  answer enddd : ",
        data.answer
      );
      if (setRemoteAns) {
        await setRemoteAns(data.answer);
      } else {
        console.error("setRemoteAns is undefined");
      }

      for (const track of myMediaStream?.getTracks() || []) {
        if (myMediaStream) {
          peer?.addTrack(track, myMediaStream);
        }
      }
    },
    [setRemoteAns]
  );

  // Listen for 'user-joined' event and handle it
  useEffect(() => {
    socket?.on("user-joined", handleNewUserJoined);

    socket?.on("incoming-call", handleIncomingCall);

    socket?.on("call-accepted", handleAnswerCall);

    return () => {
      socket?.off("user-joined", handleNewUserJoined); // Cleanup on component unmount
      socket?.off("incoming-call", handleIncomingCall);
      socket?.off("call-accepted", handleAnswerCall);
    };
  }, [handleAnswerCall, handleIncomingCall, handleNewUserJoined, socket]); // Dependencies

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // pela remote a mokali dav
    sendStream(stream);
    // pachhi khud ne jova mate save karu
    setmyMediaStream(stream);
  }, [sendStream]);

  useEffect(() => {
    console.log("x");
    getUserMediaStream();

    console.log("remote media : ", remoteMediaStream);
  }, [getUserMediaStream, remoteMediaStream]);

  // negotiation needed
  const handleNegotiation = useCallback(async () => {
    const localoffer = peer?.createOffer();
    socket.emit("call-user", { emailId: remoteEmailId, offer: localoffer });
  }, [peer, remoteEmailId, socket]);

  useEffect(() => {
    peer!.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer?.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [handleNegotiation, peer]);

  // Render logic, moved after hooks to avoid conditional hooks
  if (!socketCtx) {
    return <div>Socket ctx not found</div>;
  }

  if (!WebRtcCtx) {
    return <div>WebRtcContext not found</div>;
  }

  return (
    <div>
      <h1>You are in room number {params.roomId}</h1>
      {myMediaStream && (
        <div className="border h-[400px] w-[400px]">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              sendStream(myMediaStream);
              console.log(remoteMediaStream);
            }}
          >
            Start Video
          </button>
          <ReactPlayer
            url={myMediaStream}
            playing
            // width="100%"
            // height="100%"
            // style={{ objectFit: "cover" }} // Ensures the video covers the area
            // config={{
            //   file: {
            //     attributes: {
            //       controls: true, // Display controls for the player
            //     },
            //   },
            // }}
          />

          <h1>another</h1>

          <div className="border bg-slate-300 h-[400px] w-[400px]">
            {<ReactPlayer url={remoteMediaStream} playing />}
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
