import { v2 as cloudinary } from "cloudinary";

export const cloud = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
    secure: true,
  });
  return cloudinary;
};

// upload single file
export const cloudFileUpload = async ({
  file,
  folder = "general",
}: {
  file: { path: string };
  folder: string;
}) => {
  const cloudUpload = await cloud().uploader.upload(file.path as string, {
    folder: `${process.env.APPLICATION_NAME}/${folder}`,
  });
  return cloudUpload;
};

// upload multiple files
export const cloudfilesupload = async ({
  files = [],
  folder = "general",
} = {}) => {
  const uploadedFiles: { imageUrl: string; asset_id: string }[] = [];
  await Promise.all(
    files.map(async (file) => {
      const { secure_url, public_id } = await cloudFileUpload({ file, folder });
      uploadedFiles.push({ imageUrl: secure_url, asset_id: public_id });
    }),
  );
  return uploadedFiles;
};

// delete single file
export const cloudFileDelete = async ({ asset_id = "" } = {}) => {
  return await cloud().uploader.destroy(asset_id);
};

export const cloudResourceDelete = async ({
  asset_ids = [],
  options = {
    type: "upload",
    resource_type: "image",
  },
} = {}) => {
  return await cloud().api.delete_resources(asset_ids, options);
};

export const cloudDeleteFolderByPrefix = async ({ prefix = "" } = {}) => {
  return await cloud().api.delete_resources_by_prefix(
    `${process.env.APPLICATION_NAME}/${prefix}`,
  );
};
