import Joi from "joi";
import { generalFieldsSchema } from "../../../lib/constants/schema.constant.js";

export const userSharedDataSchema = {
  params: Joi.object().keys({
    id: generalFieldsSchema.id.required(),
  }),
};
