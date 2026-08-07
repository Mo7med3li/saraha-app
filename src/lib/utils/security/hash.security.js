import bcrypt from "bcryptjs";

export const generateHash = ({
  plainText,
  saltRounds = process.env.SALT_ROUNDS,
}) => {
  return bcrypt.hashSync(plainText, parseInt(saltRounds));
};

export const compareHashPassword = ({ password, hashedPassword }) => {
  return bcrypt.compareSync(password, hashedPassword);
};
