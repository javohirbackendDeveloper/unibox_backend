import { Router } from "express";

import { protectRoute } from "../middlewares/AuthMiddleware";

import { createMessage, getMessages } from "../controllers/Message.controller";
import upload from "../middlewares/multer";

const messageRouter: Router = Router();

messageRouter.post("/", protectRoute, upload.single("file"), createMessage);
messageRouter.get("/:friendshipId", protectRoute, getMessages);

export default messageRouter;
