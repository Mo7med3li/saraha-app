import type { Request } from "express";
import multer from "multer";

export const cloudinaryFileUpload = ({
  filterValidation = [],
}: {
  filterValidation: string[];
}) => {
  const storage = multer.diskStorage({});

  const fileFilter = function (req: Request, file: any, callback: any) {
    if (filterValidation.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(
      new Error(
        `Invalid file type. Allowed types are: ${filterValidation.join(", ")}`,
        {
          cause: 400,
        },
      ),
      false,
    );
  };
  return multer({
    dest: "./temp",
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB
    },
    fileFilter,
    storage,
  });
};
