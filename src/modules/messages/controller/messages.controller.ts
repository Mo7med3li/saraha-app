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

/**
 * @swagger
 * /messages/{receiverId}:
 *   post:
 *     summary: Send an anonymous message to a user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user receiving the message
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message text content
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 2
 *                 description: Image attachments (max 2)
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *       400:
 *         description: Validation error or no content/attachments provided
 *       404:
 *         description: Receiver not found
 */
messagesRouter.post(
  "/:receiverId",
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).array("attachments", 2),
  validationMiddleware(createMessageSchema),
  createMessage,
);

/**
 * @swagger
 * /messages/{receiverId}/sender:
 *   post:
 *     summary: Send a message as an authenticated user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user receiving the message
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message text content
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 2
 *                 description: Image attachments (max 2)
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *       400:
 *         description: Validation error or no content/attachments provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receiver not found
 */
messagesRouter.post(
  "/:receiverId/sender",
  authMiddleware(),
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).array("attachments", 2),
  validationMiddleware(createMessageSchema),
  createMessage,
);

/**
 * @swagger
 * /messages/{messageId}/reply:
 *   post:
 *     summary: Reply to a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to reply to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Reply message text content
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 2
 *                 description: Image attachments (max 2)
 *     responses:
 *       201:
 *         description: Reply sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *       400:
 *         description: Validation error, no content/attachments, or cannot reply to anonymous message
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found or original sender not found
 */
messagesRouter.post(
  "/:messageId/reply",
  authMiddleware(),
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).array("attachments", 2),
  validationMiddleware(createReplyMessageSchema),
  createReplyMessage,
);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Get all messages for a user (paginated)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose messages to retrieve
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view these messages
 */
messagesRouter.get("/:userId", authMiddleware(), getMessagesByUserId);

export default messagesRouter;
