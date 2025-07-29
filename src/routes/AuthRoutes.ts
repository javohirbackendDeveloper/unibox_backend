import { Router } from "express";
import {
  deleteProfileImage,
  getAllUsersWithoutContacts,
  getOneUser,
  getProfile,
  login,
  logout,
  refreshToken,
  register,
  updateProfile,
  uploadProfileImage,
} from "../controllers/AuthController";
import { protectRoute } from "../middlewares/AuthMiddleware";
import upload from "../middlewares/multer";

const authRouter: Router = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refreshToken", refreshToken);
authRouter.post("/logout", logout);
authRouter.get("/getProfile", protectRoute, getProfile);
authRouter.get("/getAllUsers", protectRoute, getAllUsersWithoutContacts);
authRouter.get("/getOneUser/:userId", getOneUser);
authRouter.patch("/updateProfile", protectRoute, updateProfile);
authRouter.patch("/deleteProfileImage", protectRoute, deleteProfileImage);
authRouter.patch(
  "/uploadProfileImage",
  protectRoute,
  upload.single("image"),
  uploadProfileImage
);

export default authRouter;
