'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'

export function VideoCallComponent() {
  const [isCalling, setIsCalling] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Here you would set up your WebRTC connection
    // For demo purposes, we'll just set a mock video stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream()
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = new MediaStream()
    }
  }, [])

  const handleCallToggle = () => {
    setIsCalling(!isCalling)
    // Here you would handle the actual call logic
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardContent className="p-0">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardContent className="p-0">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="outline"
            size="icon"
            className={`rounded-full ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button
            onClick={handleCallToggle}
            variant="outline"
            size="icon"
            className={`rounded-full ${isCalling ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isCalling ? <PhoneOff className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
          </Button>
          <Button
            onClick={() => setIsVideoOff(!isVideoOff)}
            variant="outline"
            size="icon"
            className={`rounded-full ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </div>
  )
}