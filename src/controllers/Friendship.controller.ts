import { Request, Response } from "express";
import { FriendAndUserDto, FriendShipDto } from "../dto/friendship.dto";
import { Friendship, User } from "../entity/user.entity";
import { Message } from "../dto/message.dto";
import { server } from "../utils/socket";
import { deleteMessages } from "./Message.controller";

export const createFriendship = async (req: Request, res: Response) => {
  try {
    const user1 = req.user;

    const { user2 }: FriendShipDto = req.body;

    const user2Profile = await User.findOneBy({ id: user2 });

    if (!user2Profile) {
      return res.json({
        message: "Bu foydalanuvchi mavjud emas",
        status: 404,
        success: false,
      } as Message);
    }

    const createdFriendship = Friendship.create({
      user1: user1,
      user2: user2Profile,
    });

    await Friendship.save(createdFriendship);

    server.emit("send_invite", {
      receiverId: user2Profile.id,
      senderId: user1.id,
      senderName: user1.name,
      friendshipId: createdFriendship.id,
    });
    return res.json({
      message:
        "Taklif yuborildi, foydalanuvchi taklifni qabul qilgach u  kontaktlaringizda ko'rinadi",
      status: 201,
      success: true,
    } as Message);
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};

export const getMyFriendInvites = async (req: Request, res: Response) => {
  try {
    const user2 = req.user;

    const userFriendInvites = await User.findOne({
      where: { id: user2.id },
      relations: ["sentFriendRequest", "receivedFriend"],
    });

    return res.json(userFriendInvites);
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const user2 = req.user;

    const { friendshipId } = req.params;

    const acceptToInvite = await Friendship.findOne({
      relations: ["user2"],
      where: { id: Number(friendshipId) },
    });

    console.log({ acceptToInvite });
    if (!acceptToInvite) {
      return res.json({
        message: "Bunday taklif mavjud emas",
        status: 404,
        success: false,
      } as Message);
    }

    const updated = await Friendship.update(
      { id: Number(friendshipId) },
      { isConfirmed: true }
    );

    return res.json(updated);
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};

export const cancelInvite = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { friendshipId } = req.params;

    const friendship = await Friendship.findOne({
      where: { id: +friendshipId },
      relations: ["user1", "user2"],
    });

    if (
      user?.id !== friendship?.user1?.id &&
      user?.id !== friendship?.user2?.id
    ) {
      return res.json({ message: "Bu chat taklif sizga tegishli emas" });
    }
    const response = await deleteMessages(Number(friendshipId));

    const canceledInvite = await Friendship.delete({
      id: Number(friendshipId),
    });

    console.log({ response });
    return res.json(canceledInvite);
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};

export const getMyFriendships = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const userFriendships = await Friendship.find({
      where: { isConfirmed: true },
      relations: ["user1", "user2", "messages", "messages.sender"],
    });

    const onlyUserFriends: FriendAndUserDto[] = [];

    userFriendships.forEach((friend) => {
      const friendMessage = (friend.messages &&
        friend.messages?.length > 0 &&
        friend.messages?.[friend.messages.length - 1]) || {
        text: "",
        image: "",
        voice: "",
        sender: null,
      };

      if (friend.user1?.id === user.id || friend.user2?.id === user.id) {
        const addedData: FriendAndUserDto = {
          friendship: {
            id: friend.id,
            lastMessage:
              friendMessage?.text ||
              friendMessage?.image ||
              friendMessage?.voice ||
              "",
            senderId: friendMessage?.sender?.id as number,
            isConfirmed: friend.isConfirmed as boolean,
            createdAt: friend.createdAt,
            updatedAt: friend.updatedAt,
          },
          user: friend.user1?.id === user.id ? friend.user2 : friend.user1,
        };

        onlyUserFriends.push(addedData);
      }
    });

    return res.json(onlyUserFriends);
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};

export const getMyContacts = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const myAllContacts = await Friendship.find({
      relations: ["user1", "user2"],
      where: [
        { user1: { id: user.id }, isConfirmed: true },
        { user2: { id: user.id }, isConfirmed: true },
      ],
    });
    const sentInvites = await Friendship.find({
      relations: ["user1", "user2"],

      where: { user1: { id: user.id }, isConfirmed: false },
    });

    const acceptedInvites = await Friendship.find({
      relations: ["user1", "user2"],

      where: { user2: { id: user.id }, isConfirmed: false },
    });

    return res.json({ myAllContacts, sentInvites, acceptedInvites });
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};

export const getUnreadInvites = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const unreadInvites = await Friendship.find({
      where: { user2: { id: user.id }, isRead: false },
    });

    return res.json(unreadInvites);
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};

export const updateRead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log({ user });

    const unreadInvites = await Friendship.find({
      where: { user2: { id: user.id }, isRead: false },
    });

    for (const invite of unreadInvites) {
      await Friendship.update({ id: invite.id }, { isRead: true });
    }
    return res.json(unreadInvites);
  } catch (err) {
    console.log(err);
    return res.json({ err });
  }
};
