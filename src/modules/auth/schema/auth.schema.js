import Joi from "joi";
import { generalFieldsSchema } from "../../../lib/constants/schema.constant.js";

// Login schema
export const loginSchema = {
  body: Joi.object().keys({
    email: generalFieldsSchema.email.required(),
    password: generalFieldsSchema.password.required(),
  }),
};

// Signup schema
export const signupSchema = {
  body: loginSchema.body.append({
    userName: generalFieldsSchema.userName.required(),
    confirmPassword: generalFieldsSchema.confirmPassword.required(),
    phoneNumber: generalFieldsSchema.phoneNumber.required(),
    gender: generalFieldsSchema.gender.required(),
  }),
};

export const confirmEmailSchema = {
  body: Joi.object().keys({
    email: generalFieldsSchema.email.required(),
    otp: generalFieldsSchema.otp.required(),
  }),
};

export const resendConfirmEmailSchema = {
  body: Joi.object().keys({
    email: generalFieldsSchema.email.required(),
  }),
};

export const googleAuthSchema = {
  body: Joi.object().keys({
    idToken: Joi.string().required(),
  }),
};

export const refreshTokenSchema = {
  headers: Joi.object()
    .keys({
      authorization: Joi.string().required(),
    })
    .unknown(true),
};

export const sendForgotPasswordOtpSchema = {
  body: Joi.object().keys({
    email: generalFieldsSchema.email.required(),
  }),
};

export const verifyForgotPasswordOtpSchema = {
  body: Joi.object().keys({
    email: generalFieldsSchema.email.required(),
    otp: generalFieldsSchema.otp.required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object().keys({
    email: generalFieldsSchema.email.required(),
    otp: generalFieldsSchema.otp.required(),
    newPassword: generalFieldsSchema.password.required(),
    confirmPassword: generalFieldsSchema.confirmPassword.required(),
  }),
};

export const logoutSchema = {
  body: Joi.object().keys({
    flag: generalFieldsSchema.flag,
  }),
};
