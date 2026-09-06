import type { JwtPayload } from "jsonwebtoken";

export interface AuthJwtPayload extends JwtPayload {
  _id: string;
  jti?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>;
      decoded?: AuthJwtPayload;
    }
  }
}

export {};
