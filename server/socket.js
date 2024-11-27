import { Server } from "socket.io";
import { User } from "./models/user.model.js";

const CORS_ORIGIN = process.env.CLIENT_URL || process.env.LOCAL_URL || 'http://localhost:5173'

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user_connected", async (userId) => {
      userSocketMap.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      console.log("status change login:", userId, socket.id);

      io.emit("user_status_change", { userId, isOnline: true });
    });

    socket.on("send_message", async (data) => {
      const receiverSocketId = userSocketMap.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", data);
      }
    });

    socket.on("typing", (data) => {
      const receiverSocketId = userSocketMap.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { userId: data.sender });
      }
    });

    socket.on("disconnect", async () => {
      let userId;

      // Find the disconnected userId
      for (const [key, value] of userSocketMap.entries()) {
        if (value === socket.id) {
          userId = key;
          break;
        }
      }

      if (userId) {
        userSocketMap.delete(userId);

        // Update the user status in the database
        await User.findByIdAndUpdate(userId, { isOnline: false });

        // Emit the user_status_change event to all clients
        io.emit("user_status_change", { userId, isOnline: false });
        console.log("User disconnected:", userId, socket.id);
      }
    });
  });

  return io;
};
