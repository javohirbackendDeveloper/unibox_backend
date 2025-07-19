import { NextFunction, Request, Response } from "express";

import * as jwt from "jsonwebtoken";
import { User } from "../entity/user.entity";

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No access token provided" });
    }

    try {
      if (accessToken) {
        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET as string
        ) as jwt.JwtPayload;

        const user = await User.findOne({
          where: { id: decoded.userId },
          select: { password: false },
        });

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        req.user = user;

        next();
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized - Invalid access token" });
  }
};
