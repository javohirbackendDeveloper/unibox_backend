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
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
// database
main();

// server with socket.io

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

setupSocket(io);
// routers

app.use("/api/auth", authRouter);
app.use("/api/friendship", friendshipRouter);
app.use("/api/message", messageRouter);
app.use("/api/zego", zegoRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server is running on " + PORT);
});
