import { Request, Response } from "express";
import { UserRegisterDto } from "src/dto/user.dto";
import { Friendship, User } from "../entity/user.entity";
import { Message } from "src/dto/message.dto";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { In, Not } from "typeorm";

export const register = async (req: Request, res: Response) => {
  const { email, password, registerType }: UserRegisterDto = req.body;

  const foundUser = await User.findOne({ where: { email } });

  if (foundUser) {
    return res.json({
      message: "Bu email orqali ro'yxatdan o'tilgan",
      status: 400,
      success: false,
    } as Message);
  }

  let hashedPassword;
  if (registerType === "local") {
    hashedPassword = await bcrypt.hash(password, 12);
  }
  const createdUser = await User.create({
    email,
    registerType,
    password: hashedPassword,
  }).save();

  return res.json({
    ...createdUser,
  });
};

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "1h",
    }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

const setCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: UserRegisterDto = req.body;

    const foundedUser = await User.findOne({ where: { email } });

    if (!foundedUser) {
      return res.json({
        message: "Bu foydalanuvchi topilmadi",
        success: false,
      });
    }

    if (foundedUser.registerType === "local") {
      // local ro'yxatdan o'tgan, password bo'lishi kerak
      const isMatch = await bcrypt.compare(
        password,
        foundedUser.password as string
      );

      if (!isMatch) {
        return res.json({
          message: "Siz kiritgan parol noto'g'ri",
          success: false,
        });
      }
    }

    // Tokenlar yaratish
    const { accessToken, refreshToken } = generateTokens(foundedUser.id);
    setCookies(res, accessToken, refreshToken);

    return res.json({
      message: "Muvaffaqiyatli tizimga kirdingiz",
      accessToken,
      refreshToken,
      user: foundedUser,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server xatosi", error: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      );
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Hisobdan chiqdingiz" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as jwt.JwtPayload;

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const withFriendships = await User.find({
      where: { id: user.id },
      relations: ["sentFriendRequest", "receivedFriend"],
    });

    return res.json(withFriendships);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllUsersWithoutContacts = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;
    const userId = req.user?.id;

    const contactIds: number[] = [];

    const friendShips = await Friendship.find({
      where: [{ user1: user.id }, { user2: user.id }],
      relations: ["user1", "user2"],
    });

    friendShips.forEach((friend) => {
      if (friend.user1?.id === userId) {
        contactIds.push(Number(friend.user2?.id));
      }
      if (friend.user2?.id === userId) {
        contactIds.push(Number(friend.user1?.id));
      }
    });

    const users = await User.find({
      where: { id: Not(In([userId, ...contactIds])) },
    });

    return res.json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getOneUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.find({ where: { id: Number(userId) } });

    return res.json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
