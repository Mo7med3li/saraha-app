import { v2 as cloudinary } from "cloudinary";

export const cloud = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
};

export const cloudFileUpload = async ({
  file = {},
  folder = "general",
} = {}) => {
  const cloudUpload = await cloud().uploader.upload(file.path, {
    folder: `${process.env.APPLICATION_NAME}/${folder}`,
  });
  return cloudUpload;
};

export const cloudFileDelete = async ({ asset_id = "" } = {}) => {
  return await cloud().uploader.destroy(asset_id);
};
