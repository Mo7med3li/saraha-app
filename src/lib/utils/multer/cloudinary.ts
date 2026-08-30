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

export const cloudFileUpload = async ({
  file,
  folder = "general",
}: {
  file: Pick<Express.Multer.File, "path">;
  folder?: string;
}) => {
  const cloudUpload = await cloud().uploader.upload(file.path, {
    folder: `${process.env.APPLICATION_NAME}/${folder}`,
  });
  return cloudUpload;
};

export const cloudfilesupload = async ({
  files = [],
  folder = "general",
}: {
  files?: Express.Multer.File[];
  folder?: string;
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

export const cloudFileDelete = async ({ asset_id = "" } = {}) => {
  return await cloud().uploader.destroy(asset_id);
};

export const cloudResourceDelete = async ({
  asset_ids = [],
  options = {
    type: "upload",
    resource_type: "image",
  },
}: {
  asset_ids?: string[];
  options?: { type: string; resource_type: string };
} = {}) => {
  return await cloud().api.delete_resources(asset_ids, options);
};

export const cloudDeleteFolderByPrefix = async ({ prefix = "" } = {}) => {
  return await cloud().api.delete_resources_by_prefix(
    `${process.env.APPLICATION_NAME}/${prefix}`,
  );
};
