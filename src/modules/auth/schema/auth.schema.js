import Joi from "joi";
import { Gender_Enum } from "../../../lib/constants/constants.js";

// Login schema
export const loginSchema = Joi.object().keys({
  email: Joi.string()
    .email({
      tlds: { allow: ["com", "net", "org", "in"] },
      minDomainSegments: 2,
      maxDomainSegments: 3,
    })
    .required(),
  password: Joi.string()
    .trim()
    .min(8)
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
});

// Signup schema
export const signupSchema = loginSchema.append({
  userName: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z\u0621-\u064Aء-ئ][^#&<>\"~;$^%{}?]{1,20}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user name format",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Password and confirm password do not match",
  }),
  phoneNumber: Joi.string()
    .regex(/^(002|\+2)?01[0125][0-9]{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number format",
    }),
  gender: Joi.string().valid(Gender_Enum.MALE, Gender_Enum.FEMALE).required(),
});
