import multer from "multer";
import path from "path";
import fs from "fs";

export const localFileUpload = ({ customPath = "general" } = {}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      const { user } = req;
      if (user?._id) {
        basePath += `/${user._id}`;
      }
      const uploadPath = path.resolve(`./src/${basePath}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: function (req, file, callback) {
      //^ to avoid file name collision and replaced files with the same name
      const uniqueFileName =
        Date.now() + "__" + Math.random() + "__" + file.originalname;

      file.finalPath = basePath + "/" + uniqueFileName;
      callback(null, uniqueFileName);
    },
  });
  return multer({
    dest: "./temp",
    // limits: {
    //   fileSize: 1024 * 1024 * 5, // 5MB
    // },
    storage,
  });
};
