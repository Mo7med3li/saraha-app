import jwt from "jsonwebtoken";
import { SIGNATURE_LEVEL_LABEL } from "../../constants/constants.js";

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
