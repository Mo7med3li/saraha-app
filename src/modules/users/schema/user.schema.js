import Joi from "joi";
import { generalFieldsSchema } from "../../../lib/constants/schema.constant.js";

export const userSharedDataSchema = {
  params: Joi.object().keys({
    id: generalFieldsSchema.id.required(),
  }),
};

export const userUpdateInfoSchema = {
  body: Joi.object()
    .keys({
      userName: generalFieldsSchema.userName,
      gender: generalFieldsSchema.gender,
      phoneNumber: generalFieldsSchema.phoneNumber,
    })
    .required(),
};

export const freezeAccountSchema = {
  params: Joi.object().keys({
    id: generalFieldsSchema.id,
  }),
};

export const restoreAccountSchema = {
  params: Joi.object().keys({
    id: generalFieldsSchema.id.required(),
  }),
};
