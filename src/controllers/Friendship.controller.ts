import { Request, Response } from "express";
import { FriendAndUserDto, FriendShipDto } from "../dto/friendship.dto";
import { Friendship, User } from "../entity/user.entity";
import { Message } from "../dto/message.dto";

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

    return res.json({
      message:
        "Taklif yuborildi, foydalanuvchi taklifni qabul qilgach u  kontaktlaringizda ko'rinadi",
      status: 201,
      success: true,
    } as Message);
  } catch (err) {
    return res.json({ err });
    console.log(err);
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

    const inviteToAccept = await Friendship.findOne({
      where: { id: Number(friendshipId), user2: { id: user2.id } },
    });

    if (!inviteToAccept) {
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

export const getMyFriendships = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const userFriendships = await Friendship.find({
      where: { isConfirmed: true },
      relations: ["user1", "user2", "messages", "messages.sender"],
    });

    const onlyUserFriends: FriendAndUserDto[] = [];

    userFriendships.forEach((friend) => {
      const friendMessage = friend.messages?.[friend.messages.length - 1];
      if (friend.user1?.id === user.id || friend.user2?.id === user.id) {
        const addedData: FriendAndUserDto = {
          friendship: {
            id: friend.id,
            lastMessage: friendMessage?.text as string,
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
