import {
  countDocuments,
  createOne,
  findAll,
  findOne,
} from "../../../db/db.service";
import MessageModel from "../../../db/models/message.model";
import UserModel from "../../../db/models/user.model";
import { cloudfilesupload } from "../../../lib/utils/multer/cloudinary";
import { getUploadedFiles, requireAuthUser } from "../../../lib/utils/request";
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

export const getMessagesByUserId = asyncHandler(async (req, res, next) => {
  const user = requireAuthUser(req);
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (user._id.toString() !== userId) {
    return next(
      new Error("You are not authorized to view these messages", {
        cause: 403,
      }),
    );
  }

  const [messages, total] = await Promise.all([
    findAll({
      model: MessageModel,
      filters: {
        receiverId: userId,
      },
      sort: { createdAt: -1 },
      populate: [{ path: "sender" }],
      limit,
      skip,
    }),
    countDocuments({
      model: MessageModel,
      filters: {
        receiverId: userId,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return successResponse({
    res,
    statusCode: 200,
    message: "Messages retrieved successfully",
    data: { messages, page, limit, total, totalPages },
  });
});
