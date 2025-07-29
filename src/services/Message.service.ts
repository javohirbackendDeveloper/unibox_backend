// services/message.service.ts

import { Friendship, Message, User } from "../entity/user.entity";
import { uploadFile } from "../controllers/Cloudinary.controller";

interface CreateMessagePayload {
  text?: string;
  friendship: Friendship;
  senderId: number;
  file?: Express.Multer.File;
}

export const createMessageService = async ({
  text,
  friendship,
  senderId,
  file,
}: CreateMessagePayload) => {
  try {
    let imageUrl: string | null = null;
    let voiceUrl: string | null = null;

    if (file) {
      const { result } = await uploadFile(file);
      if (file.filename === "recording.webm") {
        voiceUrl = result.secure_url;
      } else {
        imageUrl = result.secure_url;
      }
    }

    const sender = await User.findOneBy({ id: senderId });
    if (!sender) throw new Error("Sender not found");

    const message = Message.create({
      text: text || "",
      image: imageUrl || "",
      sender,
      voice: voiceUrl || "",
      friendship: friendship,
    });

    return await Message.save(message);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
