import bcrypt from "bcryptjs";

export const hashPassword = ({
  password,
  saltRounds = process.env.SALT_ROUNDS,
}) => {
  return bcrypt.hashSync(password, parseInt(saltRounds));
};

export const compareHashPassword = ({ password, hashedPassword }) => {
  return bcrypt.compareSync(password, hashedPassword);
};
