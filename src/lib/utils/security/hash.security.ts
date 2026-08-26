import bcrypt from "bcryptjs";

interface HashProps {
  plainText: string;
  saltRounds: number | undefined;
}
interface CompareHashProps {
  plainText: string;
  hash: string;
}
export const generateHash = ({
  plainText,
  saltRounds = parseInt(process.env.SALT_ROUNDS as string) || 10,
}: HashProps) => {
  return bcrypt.hashSync(plainText, saltRounds || 10);
};

export const compareHash = ({ plainText, hash }: CompareHashProps) => {
  return bcrypt.compareSync(plainText, hash);
};
