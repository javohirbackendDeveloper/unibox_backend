import { Friendship } from "../entity/user.entity";

export class Message {
  message: string;
  success: boolean;
  status: number;
}

export class FriendsMessageDto {
  text?: string;
  friendship: Friendship;
}
