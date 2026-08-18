import Joi from "joi";
import { generalFieldsSchema } from "../../../lib/constants/schema.constant.js";
import { FILE_FILTER_VALIDATION } from "../../../lib/constants/constants.js";

export const createMessageSchema = {
  // user send message or attachments or both -- one of them is required not both
  params: Joi.object()
    .keys({
      receiverId: generalFieldsSchema.id.required(),
    })
    .required(),
  body: Joi.object().keys({
    content: Joi.string().min(3).max(20000).messages({
      "string.min": "Content must be at least 3 characters long",
      "string.max": "Content must be less than 20000 characters long",
      "any.required": "Content is required",
      "string.empty": "Content is required",
    }),
  }),
  files: Joi.array()
    .items(
      Joi.object().keys({
        fieldname: generalFieldsSchema.file.fieldname.valid("attachments"),
        originalname: generalFieldsSchema.file.originalname,
        encoding: generalFieldsSchema.file.encoding,
        destination: generalFieldsSchema.file.destination,
        mimetype: generalFieldsSchema.file.mimetype.valid(
          ...FILE_FILTER_VALIDATION.image,
        ),
        filename: generalFieldsSchema.file.filename,
        path: generalFieldsSchema.file.path,
        size: generalFieldsSchema.file.size,
      }),
    )
    .min(0)
    .max(2),
};
