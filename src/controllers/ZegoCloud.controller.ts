import { Request, Response } from "express";
import { generateToken04 } from "../utils/zegoCloudAssistent";

export async function getZegoToken(req: Request, res: Response) {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.url}`;
    const url = new URL(fullUrl);
    console.log({ url });
    const userID = url.searchParams.get("userId");

    const appID = Number(process.env.APP_ID);

    const serverSecret = process.env.SERVER_SECRET as any;

    const effectiveTimeInSeconds = 3600;

    const payload = "";

    const token = generateToken04(
      appID,
      userID as string,
      serverSecret,
      effectiveTimeInSeconds,
      payload
    );

    return res.json({ token, appID });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
}
