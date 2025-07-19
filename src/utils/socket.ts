import { Server, Socket } from "socket.io";

export function setupSocket(io: Server) {
  const onlineUsers = new Map<number, string>();

  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    const userId = socket?.handshake?.query?.userId;

    if (userId) {
      onlineUsers.set(Number(userId), socket.id);
      const all = Array.from(onlineUsers.keys());
      console.log(all);

      io.emit("user_online", Array.from(onlineUsers.keys()));
    }

    socket.on("send_message", async (data) => {
      const savedMessage = {
        text: data.text,
        friendship: data.friendship,
        senderId: data.senderId,
        image: data.file,
      };

      io.emit("receive_message", savedMessage);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      const disconnectedUser = [...onlineUsers.entries()].find(
        ([, id]) => id === socket.id
      )?.[0];

      if (disconnectedUser) {
        onlineUsers.delete(disconnectedUser);
        io.emit("user_offline", disconnectedUser);
      }
    });
  });
}
