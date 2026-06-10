import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  const filename = path.basename(localFilePath);
  const localUrl = `/temp/${filename}`;

  if (!hasCloudinaryConfig) {
    return { url: localUrl };
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    return { url: localUrl };
  }
};

export { uploadOnCloudinary };
