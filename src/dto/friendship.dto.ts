import { User } from "../entity/user.entity";

export class FriendShipDto {
  user2: number;
}

class FriendshipWithoutUsers {
  id: number;
  lastMessage: string;
  senderId: number;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export class FriendAndUserDto {
  friendship?: FriendshipWithoutUsers;
  user?: User;
}
