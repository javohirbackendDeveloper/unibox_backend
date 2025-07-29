export class UserRegisterDto {
  email: string;
  password: string;
  registerType: string;
}

export class UserUpdateProfileDto {
  password?: string;
  oldPassword?: string;
  name?: string;
}
