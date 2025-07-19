import { Router } from "express";

import { protectRoute } from "../middlewares/AuthMiddleware";

import { getZegoToken } from "../controllers/ZegoCloud.controller";

const zegoRouter: Router = Router();

zegoRouter.get("/", protectRoute, getZegoToken);

export default zegoRouter;
