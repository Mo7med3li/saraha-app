import type { Request } from "express";

export const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (Array.isArray(req.files)) {
    return req.files;
  }
  return [];
};

export const requireAuthUser = (req: Request) => {
  if (!req.user) {
    throw new Error("unauthorized", { cause: 401 });
  }
  return req.user;
};

export const requireDecodedToken = (req: Request) => {
  if (!req.decoded) {
    throw new Error("invalid token", { cause: 401 });
  }
  return req.decoded;
};
