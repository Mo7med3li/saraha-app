import jwt from "jsonwebtoken";

export const generateToken = ({
  payload = {},
  signature = process.env.JWT_SECRET,
  options = { expiresIn: 60 * 60 },
}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = ({ token, signature = process.env.JWT_SECRET }) => {
  return jwt.verify(token, signature);
};
