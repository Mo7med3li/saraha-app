import multer from "multer";
import path from "path";
import fs from "fs";

export const localFileUpload = ({
  customPath = "general",
  filterValidation = [],
} = {}) => {
  const getBasePath = ({ user } = {}) =>
    user?._id
      ? `uploads/${customPath}/${user._id}`
      : `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      const uploadPath = path.resolve(`./src/${getBasePath(req)}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: function (req, file, callback) {
      //^ to avoid file name collision and replaced files with the same name
      const uniqueFileName =
        Date.now() + "__" + Math.random() + "__" + file.originalname;

      file.finalPath = getBasePath(req) + "/" + uniqueFileName;
      callback(null, uniqueFileName);
    },
  });

  const fileFilter = function (req, file, callback) {
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
