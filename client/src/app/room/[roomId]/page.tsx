"use client";
import peerServiceInstance from "@/app/service/peer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/providers/SocketContext";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

function Page({ params }: { params: { roomId: number } }) {
  // 00000000000000000000
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const handleCallToggle = () => {
    setIsCalling(!isCalling);
    // Here you would handle the actual call logic
  };
  // 00000000000000000000
  const [myMediaStream, setmyMediaStream] = useState<MediaStream | null>(null);
  const [remoteMediaStream, setremotemyMediaStream] =
    useState<MediaStream | null>(null);
  const [remoteSocketId, setremoteSocketId] = useState<string>("");

  // Define socket and WebRTC variables
  const socket = useSocket();

  const addStreamToPeer = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setmyMediaStream(stream);

    for (const track of stream!.getTracks()) {
      peerServiceInstance.peer.addTrack(track, stream!);
    }

    // console.log("cLLLLLL 0", remoteSocketId);
    // if (tru) {
    //   console.log("cLLLLLL", remoteSocketId);
    //   const offer = await peerServiceInstance.getOffer();
    //   socket.emit("call:user", { to: remoteSocketId, offer });
    // }
  }, []);

  const handleCallUser = useCallback(async () => {
    // make my offer and send to reciver with reciver socketid

    // await addStreamToPeer();
    const offer = await peerServiceInstance.getOffer();
    socket.emit("call:user", { to: remoteSocketId, offer: offer });
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

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setmyMediaStream(stream);

      for (const track of stream!.getTracks()) {
        peerServiceInstance.peer.addTrack(track, stream!);
      }

      const answer = await peerServiceInstance.getAnswer(data.offer);
      socket.emit("call:accepted", { to: data.from, answer: answer });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      peerServiceInstance.setlocalDescription(data.answer);
      console.log("call accepted from ", data.from);
      setremoteSocketId(data.from);
    },
    []
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peerServiceInstance.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

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

  useEffect(() => {
    peerServiceInstance.peer.addEventListener(
      "negotiationneeded",
      handleNegoNeeded
    );
    return () => {
      peerServiceInstance.peer.removeEventListener(
        "negotiationneeded",
        handleNegoNeeded
      );
    };
  }, []);

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
  }, [
    handleCallAccepted,
    handleIncomingCall,
    handleNegotiationFinal,
    handleNegotiationIncoming,
    handleNewUserJoined,
    socket,
  ]); // Dependencies

  const handleGetRemoteDataStream = useCallback((event: RTCTrackEvent) => {
    const remotestream = event.streams[0];
    console.log("remote stream", remotestream);
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
      {/* {remoteSocketId && (
        <button
          onClick={() => {
            handleCallUser();
          }}
        >
          Call
        </button>
      )}

      {myMediaStream && <ReactPlayer url={myMediaStream} playing />}
      {remoteMediaStream && <ReactPlayer url={remoteMediaStream} playing />} */}

      {/* 00000000000000000000 */}

      <div className="min-h-screen bg-gray-900 text-white p-4">
        <h1>You are in room number {params.roomId}</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row flex-wrap gap-4 mb-4">
            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
              <CardContent className="p-0 h-[230px] w-[250px] md:h-[400px] md:w-[420px] ">
                {myMediaStream && (
                  <ReactPlayer
                    width="100%" // Ensures the player takes up the full width of the card
                    height="100%" // Ensures the player takes up the full height of the card
                    style={{ objectFit: "cover" }} // Ensures the content scales and fits well
                    url={myMediaStream}
                    playing
                  />
                )}
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
              <CardContent className="p-0  h-[230px] w-[250px] md:h-[400px] md:w-[420px]">
                {remoteMediaStream && (
                  <ReactPlayer
                    width="100%" // Ensures the player takes up the full width of the card
                    height="100%" // Ensures the player takes up the full height of the card
                    style={{ objectFit: "cover" }} // Ensures the content scales and fits well
                    url={remoteMediaStream}
                    playing
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <button
            onClick={() => {
              addStreamToPeer();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg"
          >
            add video
          </button>
          <button
            onClick={() => {
              handleCallUser();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg"
          >
            Make Call
          </button>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            <Button
              onClick={handleCallToggle}
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isCalling
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isCalling ? (
                <PhoneOff className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </Button>
            <Button
              onClick={() => setIsVideoOff(!isVideoOff)}
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isVideoOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {isVideoOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;



// 


// "use client";
// import peerServiceInstance from "@/app/service/peer";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { useSocket } from "@/providers/SocketContext";
// import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
// import React, { useCallback, useEffect, useState } from "react";
// import ReactPlayer from "react-player";

// function Page({ params }: { params: { roomId: number } }) {
//   const [isCalling] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false); // Controls video state (on/off)
//   const [myMediaStream, setmyMediaStream] = useState<MediaStream | null>(null);
//   const [remoteMediaStream, setremotemyMediaStream] =
//     useState<MediaStream | null>(null);
//   const [remoteSocketId, setremoteSocketId] = useState<string>("");

//   // Define socket and WebRTC variables
//   const socket = useSocket();

//   const addStreamToPeer = useCallback(async () => {
//     if (!isVideoOff) {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setmyMediaStream(stream);

//       // Add each track to the peer connection
//       stream
//         .getTracks()
//         .forEach((track) => peerServiceInstance.peer.addTrack(track, stream));
//     } else {
//       if (myMediaStream) {
//         // Stop the stream tracks when turning off the camera
//         myMediaStream.getTracks().forEach((track) => track.stop());
//         setmyMediaStream(null);
//       }
//     }
//   }, [isVideoOff, myMediaStream]);

//   const handleCallUser = useCallback(async () => {
//     if (remoteSocketId) {
//       const offer = await peerServiceInstance.getOffer();
//       socket.emit("call:user", { to: remoteSocketId, offer: offer });
//     }
//   }, [remoteSocketId, socket]);

//   const handleNewUserJoined = useCallback(
//     (data: { emailId: string; id: string }) => {
//       setremoteSocketId(data.id);
//     },
//     []
//   );

//   const handleIncomingCall = useCallback(
//     async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
//       setremoteSocketId(data.from);

//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setmyMediaStream(stream);

//       stream
//         .getTracks()
//         .forEach((track) => peerServiceInstance.peer.addTrack(track, stream));

//       const answer = await peerServiceInstance.getAnswer(data.offer);
//       socket.emit("call:accepted", { to: data.from, answer });
//     },
//     [socket]
//   );

//   const handleCallAccepted = useCallback(
//     async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
//       peerServiceInstance.setlocalDescription(data.answer);
//       setremoteSocketId(data.from);
//     },
//     []
//   );

//   const handleGetRemoteDataStream = useCallback((event: RTCTrackEvent) => {
//     setremotemyMediaStream(event.streams[0]);
//   }, []);

//   const handleNegoNeeded = useCallback(async () => {
//     const offer = await peerServiceInstance.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//   }, [remoteSocketId, socket]);

//   const handleNegotiationIncoming = useCallback(
//     async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
//       const answer = await peerServiceInstance.getAnswer(data.offer);
//       socket.emit("peer:nego:done", { to: data.from, answer: answer });
//     },
//     [socket]
//   );

//   const handleNegotiationFinal = useCallback(
//     async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
//       peerServiceInstance.setlocalDescription(data.answer);
//     },
//     []
//   );

//   useEffect(() => {
//     peerServiceInstance.peer.addEventListener(
//       "negotiationneeded",
//       handleNegoNeeded
//     );
//     return () => {
//       peerServiceInstance.peer.removeEventListener(
//         "negotiationneeded",
//         handleNegoNeeded
//       );
//     };
//   }, [handleNegoNeeded]);

//   useEffect(() => {
//     peerServiceInstance.peer.addEventListener(
//       "track",
//       handleGetRemoteDataStream
//     );
//     return () => {
//       peerServiceInstance.peer.removeEventListener(
//         "track",
//         handleGetRemoteDataStream
//       );
//     };
//   }, [handleGetRemoteDataStream]);

//   useEffect(() => {
//     socket?.on("user:joined", handleNewUserJoined);
//     socket?.on("incomming:call", handleIncomingCall);
//     socket?.on("call:accepted", handleCallAccepted);
//     socket?.on("peer:nego:needed", handleNegotiationIncoming);
//     socket?.on("peer:nego:done", handleNegotiationFinal);

//     return () => {
//       socket?.off("user:joined", handleNewUserJoined);
//       socket?.off("incomming:call", handleIncomingCall);
//       socket?.off("call:accepted", handleCallAccepted);
//       socket?.off("peer:nego:needed", handleNegotiationIncoming);
//       socket?.off("peer:nego:done", handleNegotiationFinal);
//     };
//   }, [
//     handleNewUserJoined,
//     handleIncomingCall,
//     handleCallAccepted,
//     handleNegotiationIncoming,
//     handleNegotiationFinal,
//     socket,
//   ]);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-4">
//       <h1>You are in room number {params.roomId}</h1>
//       <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>

//       <div className="max-w-4xl mx-auto">
//         <div className="flex flex-row flex-wrap gap-4 mb-4">
//           <Card className="bg-gray-800 border-gray-700 overflow-hidden">
//             <CardContent className="p-0 h-[230px] w-[250px] md:h-[400px] md:w-[420px] ">
//               {myMediaStream && !isVideoOff ? (
//                 <ReactPlayer
//                   width="100%"
//                   height="100%"
//                   style={{ objectFit: "cover" }}
//                   url={myMediaStream}
//                   playing
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-700">Video Off</div>
//               )}
//             </CardContent>
//           </Card>

//           <Card className="bg-gray-800 border-gray-700 overflow-hidden">
//             <CardContent className="p-0 h-[230px] w-[250px] md:h-[400px] md:w-[420px]">
//               {remoteMediaStream ? (
//                 <ReactPlayer
//                   width="100%"
//                   height="100%"
//                   style={{ objectFit: "cover" }}
//                   url={remoteMediaStream}
//                   playing
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-700">
//                   Waiting for Remote Video
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Video Toggle and Call Button */}
//         <div className="flex justify-center space-x-4">
//           <Button
//             onClick={() => {
//               setIsMuted(!isMuted);
//             }}
//             variant="outline"
//             size="icon"
//             className={`rounded-full ${
//               isMuted
//                 ? "bg-red-600 hover:bg-red-700"
//                 : "bg-gray-700 hover:bg-gray-600"
//             }`}
//           >
//             {isMuted ? (
//               <MicOff className="h-6 w-6" />
//             ) : (
//               <Mic className="h-6 w-6" />
//             )}
//           </Button>

//           <Button
//             onClick={handleCallUser}
//             variant="outline"
//             size="icon"
//             className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg"
//           >
//             make call
//             {isCalling ? (
//               <PhoneOff className="h-6 w-6" />
//             ) : (
//               <Phone className="h-6 w-6" />
//             )}
//           </Button>

//           <Button
//             onClick={() => {
//               setIsVideoOff(!isVideoOff);
//               addStreamToPeer();
//             }}
//             variant="outline"
//             size="icon"
//             className={`rounded-full ${
//               isVideoOff
//                 ? "bg-red-600 hover:bg-red-700"
//                 : "bg-gray-700 hover:bg-gray-600"
//             }`}
//           >
//             {isVideoOff ? (
//               <VideoOff className="h-6 w-6" />
//             ) : (
//               <Video className="h-6 w-6" />
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Page;
