import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (file: Express.Multer.File) => {
  try {
    const result = await cloudinary.uploader.upload(file.path);

    return { result };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
