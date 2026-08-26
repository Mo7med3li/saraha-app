import cryptoJs from "crypto-js";
interface EncryptionProps {
  plainText: string;
  key: string | undefined;
}
interface DecryptionProps {
  cipherText: string;
  key: string | undefined;
}
export const encryption = ({
  plainText,
  key = process.env.AES_SECRET_KEY,
}: EncryptionProps) => {
  return cryptoJs.AES.encrypt(plainText, key as string).toString();
};

export const decryption = ({
  cipherText,
  key = process.env.AES_SECRET_KEY,
}: DecryptionProps) => {
  return cryptoJs.AES.decrypt(cipherText, key as string).toString(
    cryptoJs.enc.Utf8,
  );
};
