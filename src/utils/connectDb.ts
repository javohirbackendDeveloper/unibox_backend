import { Friendship, Message, TextEditor, User } from "../entity/user.entity";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export const main = new DataSource({
  type: "postgres",
  host: process.env.HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  entities: [User, Friendship, Message, TextEditor],
  synchronize: true,
});
