
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authenticate every socket connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

      socket.user = {
        id: decoded.id,
        email: decoded.email,
        roles: decoded.roles || [],
      };

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Authenticated socket connected:", socket.user.id);

    // Join the private room only if the user is a barber
    if (socket.user.roles.includes("BARBER")) {
      socket.join(`barber:${socket.user.id}`);

      console.log(`Barber joined room: barber:${socket.user.id}`);
    }

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.id);
    });
  });

  console.log("Socket.IO initialized");

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
