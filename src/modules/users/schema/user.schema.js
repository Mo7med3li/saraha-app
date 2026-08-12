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

export const deleteAccountSchema = {
  params: Joi.object().keys({
    id: generalFieldsSchema.id.required(),
  }),
};

export const updatePasswordSchema = {
  body: Joi.object()
    .keys({
      oldPassword: generalFieldsSchema.password.required(),
      password: generalFieldsSchema.password
        .required()
        .not(Joi.ref("oldPassword"))
        .messages({
          "any.invalid": "New password must be different from old password",
        }),
      confirmPassword: generalFieldsSchema.confirmPassword.required(),
      flag: generalFieldsSchema.flag,
    })
    .required(),
};
export const logoutSchema = {
  body: Joi.object().keys({
    flag: generalFieldsSchema.flag,
  }),
};
