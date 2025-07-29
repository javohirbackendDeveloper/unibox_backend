import { Router } from "express";

import { protectRoute } from "../middlewares/AuthMiddleware";
import {
  acceptInvite,
  cancelInvite,
  createFriendship,
  getMyContacts,
  getMyFriendInvites,
  getMyFriendships,
  getUnreadInvites,
  updateRead,
} from "../controllers/Friendship.controller";

const friendshipRouter: Router = Router();

friendshipRouter.post("/", protectRoute, createFriendship);
friendshipRouter.get("/", protectRoute, getMyFriendInvites);
friendshipRouter.get("/getAllMyFriends", protectRoute, getMyFriendships);
friendshipRouter.get("/getMyContacts", protectRoute, getMyContacts);
friendshipRouter.patch("/updateRead", protectRoute, updateRead);
friendshipRouter.patch("/:friendshipId", protectRoute, acceptInvite);
friendshipRouter.delete("/:friendshipId", protectRoute, cancelInvite);
friendshipRouter.get("/getUnreadInvites", protectRoute, getUnreadInvites);

export default friendshipRouter;
