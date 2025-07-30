import express from "express";
import * as dotenv from "dotenv";
import { main } from "./utils/connectDb";
import authRouter from "./routes/AuthRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";
import friendshipRouter from "./routes/Friendship.routes";
import { protectRoute } from "./middlewares/AuthMiddleware";
import messageRouter from "./routes/Message.routes";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./utils/socket";
import zegoRouter from "./routes/ZegoCloud.routes";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://unibox-frontend-spxn.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

// server with socket.io

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "https://unibox-frontend-spxn.vercel.app",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

setupSocket(io);

const PORT = process.env.PORT || 3000;

// database
(async () => {
  try {
    await main.initialize();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
})();

// routers

app.use("/api/auth", authRouter);
app.use("/api/friendship", friendshipRouter);
app.use("/api/message", messageRouter);
app.use("/api/zego", zegoRouter);

server.listen(PORT, () => {
  console.log("Server is running on " + PORT);
});
