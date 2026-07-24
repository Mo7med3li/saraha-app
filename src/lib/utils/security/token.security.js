import jwt from "jsonwebtoken";
import { findById } from "../../../db/db.service.js";
import UserModel from "../../../db/models/user.model.js";
import {
  ROLES_ENUM,
  SIGNATURE_LEVEL_LABEL,
  TOKEN_TYPES_ENUM,
} from "../../constants/constants.js";

export const generateToken = ({
  payload = {},
  signature = process.env.USER_JWT_SECRET,
  options = { expiresIn: 60 * 60 },
}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = ({
  token,
  signature = process.env.USER_JWT_SECRET,
}) => {
  return jwt.verify(token, signature);
};

export const getSignature = ({ bearer = SIGNATURE_LEVEL_LABEL.BEARER }) => {
  const signatureLevel =
    bearer === SIGNATURE_LEVEL_LABEL.BEARER ? "USER" : "SYSTEM";
  const accessSignature =
    process.env[`${signatureLevel}_JWT_SECRET`] || process.env.USER_JWT_SECRET;
  const refreshSignature =
    process.env[`${signatureLevel}_REFRESH_JWT_SECRET`] ||
    process.env.USER_REFRESH_JWT_SECRET;
  return { accessSignature, refreshSignature };
};

export const decodeToken = async ({
  next,
  authorization,
  tokenType = TOKEN_TYPES_ENUM.ACCESS,
}) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!token || !bearer) {
    return next(new Error("token is required", { cause: 401 }));
  }

  // get the signature based on the bearer level
  const { accessSignature, refreshSignature } = getSignature({ bearer });
  const decodedToken = verifyToken({
    token,
    signature:
      tokenType === TOKEN_TYPES_ENUM.ACCESS
        ? accessSignature
        : refreshSignature,
  });
  if (!decodedToken?._id) {
    return next(new Error("invalid token", { cause: 401 }));
  }
  const { _id } = decodedToken;
  const user = await findById({
    model: UserModel,
    id: _id,
    select: "-password",
  });
  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }
  return user;
};

export const generateTokens = async ({ user }) => {
  const signatureLevel =
    user.role === ROLES_ENUM.ADMIN
      ? SIGNATURE_LEVEL_LABEL.SYSTEM
      : SIGNATURE_LEVEL_LABEL.BEARER;
  const { accessSignature, refreshSignature } = getSignature({
    bearer: signatureLevel,
  });

  const token = generateToken({
    payload: { _id: user._id },
    signature: accessSignature,
    options: {
      expiresIn: 60 * 30,
    },
  });

  const refreshToken = generateToken({
    payload: { _id: user._id },
    signature: refreshSignature,
    options: {
      expiresIn: "1y",
    },
  });
  return { accessToken: token, refreshToken };
};
