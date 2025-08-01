import { Request, Response } from "express";
import { FriendsMessageDto } from "../dto/message.dto";
import { Friendship, Message, User } from "../entity/user.entity";
import { uploadFile } from "./Cloudinary.controller";
import { createMessageService } from "../services/Message.service";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const sender = req.user;
    console.log({ data: req.body, user: sender });
    const { text, friendship }: FriendsMessageDto = req.body;

    const file = req.file;

    const message = await createMessageService({
      text,
      friendship,
      senderId: sender.id,
      file,
    });

    return res.json(message);
  } catch (err) {
    console.error(err);
    return res.json({ error: "Xatolik yuz berdi", details: err });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await Friendship.findOne({
      where: { id: Number(friendshipId) },
      relations: ["messages", "messages.sender"],
    });

    if (!friendship) {
      return res.status(404).json({ message: "Friendship topilmadi" });
    }

    const sortedMessages = friendship.messages?.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    res.json(sortedMessages);
    return sortedMessages;
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Xabarlarni olishda xatolik", error: err });
  }
};

export const deleteMessages = async (friendshipId: number) => {
  try {
    const messages = await Message.delete({ friendship: { id: friendshipId } });
    return messages;
  } catch (err) {
    console.log(err);
    return { message: "Xabarlarni olishda xatolik", error: err };
  }
};

export const updateMessageRead = async (req: Request, res: Response) => {
  try {
    const result = await getMessages(req, res);
    const messages = Array.isArray(result) ? result : [];

    for (const message of messages) {
      if (!message?.isRead) {
        await Message.update({ id: message?.id }, { isRead: true });
      }
    }
    return messages;
  } catch (err) {
    console.log(err);
    return { message: "Xabarlarni olishda xatolik", error: err };
  }
};
