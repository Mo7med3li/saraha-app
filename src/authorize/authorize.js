import { ROLES_ENUM } from "../lib/constants/constants.js";

export const authorize = {
  profile: [ROLES_ENUM.USER, ROLES_ENUM.ADMIN],
  restoreAccount: [ROLES_ENUM.ADMIN],
  deleteAccount: [ROLES_ENUM.ADMIN],
};
