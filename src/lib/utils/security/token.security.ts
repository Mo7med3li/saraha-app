import jwt, { type SignOptions } from "jsonwebtoken";
import { createOne, findById, findOne } from "../../../db/db.service";
import UserModel from "../../../db/models/user.model";
import {
  ROLES_ENUM,
  SIGNATURE_LEVEL_LABEL,
  TOKEN_TYPES_ENUM,
} from "../../constants/constants";
import { nanoid } from "nanoid";
import TokenModel from "../../../db/models/token.model";
import type { NextFunction } from "express";
import type { AuthJwtPayload } from "../../../types/express";

type TokenType =
  (typeof TOKEN_TYPES_ENUM)[keyof typeof TOKEN_TYPES_ENUM];

export const generateToken = ({
  payload = {},
  signature = process.env.USER_JWT_SECRET,
  options = {
    expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME),
  },
}: {
  payload?: Record<string, unknown>;
  signature?: string;
  options?: SignOptions;
}) => {
  return jwt.sign(payload, signature as string, options);
};

export const verifyToken = ({
  token,
  signature = process.env.USER_JWT_SECRET,
}: {
  token: string;
  signature?: string;
}) => {
  return jwt.verify(token, signature as string) as AuthJwtPayload;
};

export const getSignature = ({
  bearer = SIGNATURE_LEVEL_LABEL.BEARER,
}: {
  bearer?: string;
} = {}) => {
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
}: {
  next: NextFunction;
  authorization?: string | undefined;
  tokenType?: TokenType;
}) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!token || !bearer) {
    return next(new Error("token is required", { cause: 401 }));
  }

  const { accessSignature, refreshSignature } = getSignature({ bearer });
  const decoded = verifyToken({
    token,
    signature: (tokenType === TOKEN_TYPES_ENUM.ACCESS
      ? accessSignature
      : refreshSignature) as string,
  });

  if (!decoded?._id) {
    return next(new Error("invalid token", { cause: 401 }));
  }

  const { _id } = decoded;
  if (
    decoded.jti &&
    (await findOne({
      model: TokenModel,
      filters: {
        jti: decoded.jti,
      },
    }))
  ) {
    return next(
      new Error("this token is logged out before and cannot be used again", {
        cause: 401,
      }),
    );
  }

  const user = await findById({
    model: UserModel,
    id: _id,
  });

  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }

  return { user, decoded };
};

export const generateTokens = async ({ user }: { user: Record<string, any> }) => {
  const signatureLevel =
    user.role === ROLES_ENUM.ADMIN
      ? SIGNATURE_LEVEL_LABEL.SYSTEM
      : SIGNATURE_LEVEL_LABEL.BEARER;
  const { accessSignature, refreshSignature } = getSignature({
    bearer: signatureLevel,
  });
  const jwtid = nanoid();
  const token = generateToken({
    payload: { _id: user._id },
    signature: accessSignature as string,
    options: {
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME),
      jwtid,
    },
  });

  const refreshToken = generateToken({
    payload: { _id: user._id },
    signature: refreshSignature as string,
    options: {
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION_TIME),
      jwtid,
    },
  });
  return { accessToken: token, refreshToken };
};

export const createRevokedToken = async ({
  decoded,
}: {
  decoded: AuthJwtPayload;
}) => {
  await createOne({
    model: TokenModel,
    data: [
      {
        jti: decoded.jti,
        userId: decoded._id,
        expiresAt:
          (decoded.iat ?? 0) + Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME),
      },
    ],
  });
  return true;
};
