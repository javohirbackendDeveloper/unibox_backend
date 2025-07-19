import { Router } from "express";
import {
  getAllUsersWithoutContacts,
  getOneUser,
  getProfile,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/AuthController";
import { protectRoute } from "../middlewares/AuthMiddleware";

const authRouter: Router = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refreshToken", refreshToken);
authRouter.post("/logout", logout);
authRouter.get("/getProfile", protectRoute, getProfile);
authRouter.get("/getAllUsers", protectRoute, getAllUsersWithoutContacts);
authRouter.get("/getOneUser/:userId", getOneUser);

export default authRouter;
