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
    console.log({ file });

    let imageUrl: string | null = null;

    if (file) {
      const { result } = await uploadFile(file);
      imageUrl = result.secure_url;
    }

    const sender = await User.findOneBy({ id: senderId });
    if (!sender) throw new Error("Sender not found");

    const message = Message.create({
      text: text || "",
      image: imageUrl || "",
      sender,
      friendship: friendship,
    });

    return await Message.save(message);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
