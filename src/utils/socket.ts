import { Server, Socket } from "socket.io";
import { Friendship, Message } from "../entity/user.entity";
import { Not } from "typeorm";
import { TextEditor } from "../entity/user.entity";

export let server: Server;
export function setupSocket(io: Server) {
  const onlineUsers = new Map<number, string>();
  server = io;
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
        voice: data.voice,
      };

      io.emit("receive_message", savedMessage);
    });

    socket.on("send_invite", (invite) => {
      const receiverSocketId = onlineUsers.get(invite.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_invitation", invite);
      }
    });

    socket.on("mark_as_read", async ({ friendshipId, readerId }) => {
      await Message.update(
        {
          friendship: { id: friendshipId },
          sender: { id: Not(readerId) },
          isRead: false,
        },
        { isRead: true }
      );

      io.emit("messages_read", { friendshipId });
    });

    socket.on("get-document", async (documentId) => {
      const document = await findOrCreateDocument(documentId);
      socket.join(documentId);
      socket.emit("load-document", JSON.parse(document?.file || "{}"));

      socket.on("send-changes", (delta) => {
        socket.broadcast.to(documentId).emit("receive-changes", delta);
      });

      socket.on("save-document", async (data) => {
        await TextEditor.update(
          { id: documentId },
          { file: JSON.stringify(data) }
        );
      });
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

const findOrCreateDocument = async (documentId: string) => {
  console.log({ documentId });

  if (!documentId) return;

  let document = await TextEditor.findOne({ where: { id: documentId } });

  if (!document) {
    document = await TextEditor.create({
      id: documentId,
      title: "Untitled Document",
      file: "",
      owner: "anonymous",
      collaborators: [],
    }).save();
  }

  return document;
};
