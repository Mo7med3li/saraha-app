import { createOne, findOne } from "../../../db/db.service";
import MessageModel from "../../../db/models/message.model";
import UserModel from "../../../db/models/user.model";
import { cloudfilesupload } from "../../../lib/utils/multer/cloudinary";
import {
  getUploadedFiles,
  requireAuthUser,
} from "../../../lib/utils/request";
import { asyncHandler, successResponse } from "../../../lib/utils/response";
import type { Request } from "express";

const hasContentOrAttachments = (req: Request) => {
  const hasContent = Boolean(req.body.content?.trim());
  const hasFiles = getUploadedFiles(req).length > 0;
  return hasContent || hasFiles;
};

export const createMessage = asyncHandler(async (req, res, next) => {
  if (!hasContentOrAttachments(req)) {
    return next(
      new Error("one of content or attachments is required", { cause: 400 }),
    );
  }

  const { receiverId } = req.params;
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

  const files = getUploadedFiles(req);
  const attachments =
    files.length > 0
      ? await cloudfilesupload({
          files,
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
});

export const createReplyMessage = asyncHandler(async (req, res, next) => {
  if (!hasContentOrAttachments(req)) {
    return next(
      new Error("one of content or attachments is required", { cause: 400 }),
    );
  }

  const user = requireAuthUser(req);
  const { messageId } = req.params;
  const message = await findOne({
    model: MessageModel,
    filters: {
      _id: messageId,
      receiverId: user._id,
    },
  });
  if (!message) {
    return next(
      new Error("Message not found or you are not the owner of this message", {
        cause: 404,
      }),
    );
  }

  if (!message.senderId) {
    return next(new Error("Cannot reply to anonymous message", { cause: 400 }));
  }

  const sender = await findOne({
    model: UserModel,
    filters: {
      _id: message.senderId,
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
  });
  if (!sender) {
    return next(new Error("Original sender not found", { cause: 404 }));
  }

  const rootMessageId = message.parentMessageId || message._id;
  const files = getUploadedFiles(req);

  const attachments =
    files.length > 0
      ? await cloudfilesupload({
          files,
          folder: `messages/${message.senderId}/attachments`,
        })
      : undefined;

  const [replyMessage] = await createOne({
    model: MessageModel,
    data: [
      {
        senderId: user._id,
        receiverId: message.senderId,
        content: req.body.content,
        attachments,
        parentMessageId: rootMessageId,
      },
    ],
  });
  return successResponse({
    res,
    message: "Reply message created successfully",
    data: replyMessage,
    statusCode: 201,
  });
});
