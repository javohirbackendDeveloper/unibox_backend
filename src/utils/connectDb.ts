import { Friendship, Message, User } from "../entity/user.entity";
import { createConnection } from "typeorm";

export async function main() {
  try {
    const connection = await createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      entities: [User, Friendship, Message],
      synchronize: true,
    });
    console.log("Connected to postgresql");
  } catch (err) {
    console.log(err);
  }
}
