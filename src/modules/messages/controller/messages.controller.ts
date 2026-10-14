import { Router } from "express";
import { createMessage, createReplyMessage } from "../services/message.service";
import { cloudinaryFileUpload } from "../../../lib/utils/multer/cloud.multer";
import { FILE_FILTER_VALIDATION } from "../../../lib/constants/constants";
import { validationMiddleware } from "../../../middleware/validation.middleware";
import {
  createMessageSchema,
  createReplyMessageSchema,
} from "../schema/message.schema";
import { authMiddleware } from "../../../middleware/authentication.middleware";

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

export default messagesRouter;
