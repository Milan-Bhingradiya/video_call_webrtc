class Peerservice {
  peer: RTCPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ], // Google STUN server
      },
    ],
  });

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      if (!offer || !offer.type || !offer.sdp) {
        console.error("Invalid offer received:", offer);
        throw new Error("Invalid offer");
      }
      await this.peer.setLocalDescription(offer);
      return offer;
    }
  }

  async getAnswer(offer: RTCSessionDescriptionInit) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return answer;
    }
  }

  async setlocalDescription(answer: RTCSessionDescriptionInit) {
    if (this.peer) {
      if (!answer || !answer.type || !answer.sdp) {
        throw new Error("Invalid answer");
      }
      await this.peer.setRemoteDescription(answer);
    }
  }
}

const peerServiceInstance = new Peerservice();
export default peerServiceInstance;
