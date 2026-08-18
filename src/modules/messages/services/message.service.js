import { createOne, findOne } from "../../../db/db.service.js";
import MessageModel from "../../../db/models/message.model.js";
import UserModel from "../../../db/models/user.model.js";
import { cloudfilesupload } from "../../../lib/utils/multer/cloudinary.js";
import { successResponse } from "../../../lib/utils/response.js";

export const createMessage = async (req, res, next) => {
  const { receiverId } = req.params;
  if (!req.body.content && !req.files.length > 0) {
    return next(
      new Error("one of content or attachments is required", { cause: 400 }),
    );
  }
  const receiver = await findOne({
    model: UserModel,
    filters: {
      _id: receiverId,
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
  });
  if (!receiver) {
    return next(new Error("Receiver not found", { cause: 404 }));
  }

  const attachments =
    req.files?.length > 0
      ? await cloudfilesupload({
          files: req.files,
          folder: `messages/${receiver._id}/attachments`,
        })
      : undefined;

  const [message] = await createOne({
    model: MessageModel,
    data: [
      {
        senderId: req.user?._id,
        receiverId: receiverId,
        content: req.body.content,
        attachments,
      },
    ],
  });
  return successResponse({
    res,
    message: "Message created successfully",
    data: message,
    statusCode: 201,
  });
};
