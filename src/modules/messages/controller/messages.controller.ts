import { Router } from "express";
import { FILE_FILTER_VALIDATION } from "../../../lib/constants/constants";
import { cloudinaryFileUpload } from "../../../lib/utils/multer/cloud.multer";
import { authMiddleware } from "../../../middleware/authentication.middleware";
import { validationMiddleware } from "../../../middleware/validation.middleware";
import {
  createMessageSchema,
  createReplyMessageSchema,
} from "../schema/message.schema";
import {
  createMessage,
  createReplyMessage,
  getMessagesByUserId,
} from "../services/message.service";

const messagesRouter = Router({
  caseSensitive: true,
  strict: true,
});

messagesRouter.post(
  "/:receiverId",
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).array("attachments", 2),
  validationMiddleware(createMessageSchema),
  createMessage,
);

messagesRouter.post(
  "/:receiverId/sender",
  authMiddleware(),
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).array("attachments", 2),
  validationMiddleware(createMessageSchema),
  createMessage,
);

messagesRouter.post(
  "/:messageId/reply",
  authMiddleware(),
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).array("attachments", 2),
  validationMiddleware(createReplyMessageSchema),
  createReplyMessage,
);

messagesRouter.get("/:userId", authMiddleware(), getMessagesByUserId);

export default messagesRouter;
