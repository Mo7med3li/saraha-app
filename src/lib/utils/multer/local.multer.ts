import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import type { Request } from "express";

export const localFileUpload = ({
  customPath = "general",
  filterValidation = [] as string[],
}: {
  customPath?: string;
  filterValidation?: string[];
} = {}) => {
  const getBasePath = (user?: Record<string, any>) =>
    user?._id ? `uploads/${customPath}/${user._id}` : `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      const uploadPath = path.resolve(`./src/${getBasePath(req.user)}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: function (req, file, callback) {
      const uniqueFileName =
        Date.now() + "__" + Math.random() + "__" + file.originalname;

      file.finalPath = getBasePath(req.user) + "/" + uniqueFileName;
      callback(null, uniqueFileName);
    },
  });

  const fileFilter = function (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) {
    if (filterValidation.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(
      new Error(
        `Invalid file type. Allowed types are: ${filterValidation.join(", ")}`,
      ),
    );
  };

  return multer({
    dest: "./temp",
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter,
    storage,
  });
};
