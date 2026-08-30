import Joi from "joi";
import { generalFieldsSchema } from "../../../lib/constants/schema.constant";
import { FILE_FILTER_VALIDATION } from "../../../lib/constants/constants";

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

export const refreshTokenSchema = {
  headers: Joi.object()
    .keys({
      authorization: Joi.string().required(),
    })
    .unknown(true),
};

export const profileImageSchema = {
  file: Joi.object().keys({
    fieldname: generalFieldsSchema.file.fieldname.valid("profileImage"),
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
};
export const profileGallerySchema = {
  files: Joi.array()
    .items(
      Joi.object()
        .keys({
          fieldname: generalFieldsSchema.file.fieldname.valid("profileGallery"),
          originalname: generalFieldsSchema.file.originalname,
          encoding: generalFieldsSchema.file.encoding,
          destination: generalFieldsSchema.file.destination,
          mimetype: generalFieldsSchema.file.mimetype.valid(
            ...FILE_FILTER_VALIDATION.image,
          ),
          filename: generalFieldsSchema.file.filename,
          path: generalFieldsSchema.file.path,
          size: generalFieldsSchema.file.size,
        })
        .required(),
    )
    .min(1)
    .max(10)
    .required(),
};
