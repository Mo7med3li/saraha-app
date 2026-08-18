import { Router } from "express";
import { createMessage } from "../services/message.service.js";
import { cloudinaryFileUpload } from "../../../lib/utils/multer/cloud.multer.js";
import { FILE_FILTER_VALIDATION } from "../../../lib/constants/constants.js";
import { validationMiddleware } from "../../../middleware/validation.middleware.js";
import { createMessageSchema } from "../schema/message.schema.js";
import { authMiddleware } from "../../../middleware/authentication.middleware.js";

const messagesRouter = Router();

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

export default messagesRouter;
