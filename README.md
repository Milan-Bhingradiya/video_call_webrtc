# Video Call WebRTC

**Video Call WebRTC** is a peer-to-peer video call application built using **WebRTC** and **Socket.io**. The app enables real-time video communication between users by manually handling the WebRTC signaling process, including creating, sending, and receiving offers and answers.

Live Demo: [Video Call WebRTC](https://video-call-webrtc-eight.vercel.app/)

## Features

1. **Real-Time Video Calls**
   - Peer-to-peer video communication.
   - High-quality video and audio streams.

2. **Manual Signaling Process**
   - WebRTC offer/answer mechanism implemented manually using **Socket.io**.
   - Handles ICE candidate exchange for establishing a stable connection.

3. **Web-Based Application**
   - Accessible from any modern web browser.
   - Deployed on **Vercel** for seamless accessibility.

## How It Works

### 1. **Signaling Process**
WebRTC requires a signaling server to exchange metadata between peers. In this application:
- **Socket.io** is used as the signaling server.
- The signaling process involves:
  - **Peer A** creates an offer and sends it to **Peer B**.
  - **Peer B** receives the offer, creates an answer, and sends it back to **Peer A**.
  - Both peers exchange ICE candidates to establish a connection.

### 2. **Peer-to-Peer Connection**
Once the signaling process is complete:
- A direct connection is established between the two peers.
- Media streams (video and audio) are shared directly, ensuring low latency and high performance.

### 3. **Real-Time Communication**
- Video and audio streams are captured using the browser's **MediaDevices API**.
- Streams are displayed locally and remotely for the users in the call.

## Tech Stack

### Frontend
- **Next JS**
- 
### Backend / Signaling Server
- **Node.js**
- **Socket.io**
- **Express.js**: For handling HTTP requests and serving the signaling server.

### Deployment
- **Vercel**: For hosting the frontend.
- **Heroku**: For hosting the backend signaling server.

## Installation and Setup

### Prerequisites
- **Node.js** installed on your machine.
- Basic knowledge of WebRTC and Socket.io.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Milan-Bhingradiya/video_call_webrtc.git
   cd video_call_webrtc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the signaling server:
   ```bash
   node server.js
   ```

4. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage

1. **Open the App**: Visit the hosted app or run it locally.
2. **Join a Room**: Both users must enter the same room ID to connect.
3. **Start the Call**: Once connected, video and audio streams are exchanged between the peers.

## Future Enhancements

- **Group Calls**: Extend the functionality to support multiple users in a single room.
- **Screen Sharing**: Add the ability to share screens during a call.
- **Chat Feature**: Enable text-based chat alongside video calls.
- **Connection Optimization**: Use TURN servers for better connection reliability in restrictive networks.

## Contribution

Contributions are welcome! Feel free to submit issues or pull requests to enhance the project.

### Steps to Contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push the changes:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

### Contact
For questions or feedback, feel free to reach out to [Milan Bhingradiya](https://github.com/Milan-Bhingradiya).

