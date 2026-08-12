import Joi from "joi";
import { Gender_Enum, LOGOUT_ENUM } from "./constants.js";
import { Types } from "mongoose";

export const generalFieldsSchema = {
  userName: Joi.string()
    .trim()
    .regex(/^[A-Za-z\u0621-\u064A]{3,20} [A-Za-z\u0621-\u064A]{3,20}$/)
    .messages({
      "string.pattern.base":
        "User name must be first and last name separated by one space (3-20 letters each)",
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({
      tlds: {
        allow: [
          "com",
          "net",
          "org",
          "edu",
          "gov",
          "io",
          "co",
          "eg",
          "info",
          "me",
          "dev",
        ],
      },
      minDomainSegments: 2,
      maxDomainSegments: 3,
    })
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required",
    }),
  password: Joi.string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/)
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must be at most 64 characters",
      "string.pattern.base":
        "Password must include uppercase, lowercase, number, and special character",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).messages({
    "any.only": "Password and confirm password do not match",
  }),
  phoneNumber: Joi.string()
    .regex(/^(002|\+2)?01[0125][0-9]{8}$/)

    .messages({
      "string.pattern.base": "Invalid phone number format",
    }),
  gender: Joi.string().valid(...Object.values(Gender_Enum)),
  otp: Joi.string().min(6).max(6).messages({
    "string.min": "OTP must be 6 digits",
    "string.max": "OTP must be 6 digits",
  }),
  id: Joi.string().custom((value, helpers) => {
    return (
      Types.ObjectId.isValid(value) || helpers.message("invalid id format")
    );
  }),
  flag: Joi.string()
    .valid(...Object.values(LOGOUT_ENUM))
    .default(LOGOUT_ENUM.STAY_LOGGED_IN),
};
