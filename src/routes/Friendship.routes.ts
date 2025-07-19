import { Router } from "express";

import { protectRoute } from "../middlewares/AuthMiddleware";
import {
  acceptInvite,
  createFriendship,
  getMyFriendInvites,
  getMyFriendships,
} from "../controllers/Friendship.controller";

const friendshipRouter: Router = Router();

friendshipRouter.post("/", protectRoute, createFriendship);
friendshipRouter.get("/", protectRoute, getMyFriendInvites);
friendshipRouter.get("/getAllMyFriends", protectRoute, getMyFriendships);
friendshipRouter.patch("/:friendshipId", protectRoute, acceptInvite);

export default friendshipRouter;
