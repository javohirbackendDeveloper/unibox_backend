import { User } from "../entity/user.entity";

export class TextEditorDto {
  title: string;
  file: JSON;
  owner: User;
  collaborators: User[];
}
