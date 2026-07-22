import cryptoJs from "crypto-js";

export const encryption = ({ plainText, key = process.env.AES_SECRET_KEY }) => {
  return cryptoJs.AES.encrypt(plainText, key).toString();
};

export const decryption = ({
  cipherText,
  key = process.env.AES_SECRET_KEY,
}) => {
  return cryptoJs.AES.decrypt(cipherText, key).toString(cryptoJs.enc.Utf8);
};
