import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

// // Create HTTP server
// const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware to serve static files or handle JSON
app.use(express.json());

app.get("/", (req, res) => {
  console.log("smm");
  res.send("Hello, Socket.IO with Express!");
});

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------
const email_to_socket = new Map();
const socket_to_email = new Map();

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const allSockets = Array.from(io.sockets.sockets.keys());
  console.log("Connected socket IDs:", allSockets);


  // when any user join roome this call
  socket.on("join-room", (data: { emailId: string; roomId: string }) => {
    const { emailId, roomId } = data;
    console.log("user joined room confirm:", emailId, roomId);

    socket.join(roomId);
    email_to_socket.set(emailId, socket.id);
    socket_to_email.set(socket.id, emailId);

    // console.log("Current email_to_socket map:");
    // email_to_socket.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });

    // console.log("Current socket_to_email map:");
    // socket_to_email.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
    socket.emit("joined-room", { emailId, roomId });
    // je roomId ma hoy ene j aa message emite kari dese...
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });

  socket.on("call-user", (data: { emailId: string; offer: any }) => {
    const { emailId, offer } = data;
    console.log("call-user:", data);

    // a to b send karvu chhe offer to a send mail of b's and offer to server..
    // now here send from server to b that a's email id and offer ...

    // a ni email id kaya thi?

    // --
    // req ma jene mokalvanu se e ni email and  khud ni offer ave chhe

    // aya socket if upper thi sender ni mail id mali
    const from_email = socket_to_email.get(socket.id);
    // have jene mokalvanuse eni sokcet id goti lidhi..
    const socketId = email_to_socket.get(emailId);

    console.log(from_email, "and ", socketId);
    console.log(from_email, "and ", socketId);
    console.log(from_email, "and ", socketId);

    console.log("xxxxxxxx");

    if (socketId) {
      console.log("yyyyyyyyy");

      try {
        socket.to(socketId).emit("incoming-call", {
          offer: data.offer,
          from: from_email,
        });
      } catch (error) {
        console.log("error in call-user:", error);
      }
    }
  });

  // ----------------------answer call----------------------

  socket.on("call-accepted", (data: { emailId: string; answer: any }) => {
    // emil reciver ni , ans sender no
    const { emailId, answer } = data;
    console.log("call-accepted:", data);

    // socketId: reciver ni chhe

    const socketId = email_to_socket.get(emailId);
    console.log("aaaaaaaaaaaa", socketId);
    if (socketId) {
      console.log("bbbbbbbbbbbbbbbbbb");
      try {
        socket.to(socketId).emit("call-accepted", {
          answer: data.answer,
        });
      } catch (error) {
        console.log("answer call eroror: ", error);
      }
    }
  });

  socket.on("disconnect", () => {
    const emailId = socket_to_email.get(socket.id);
    console.log(`Client disconnected: ${socket.id} (${emailId})`);

    if (emailId) {
      email_to_socket.delete(emailId);
    }
    socket_to_email.delete(socket.id);
  });
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
io.listen(8001);
