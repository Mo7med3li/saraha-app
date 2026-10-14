import cryptoJs from "crypto-js";

interface EncryptionProps {
  plainText: string;
  key?: string;
}
interface DecryptionProps {
  cipherText: string;
  key?: string;
}
export const encryption = ({
  plainText,
  key = process.env.AES_SECRET_KEY,
}: EncryptionProps) => {
  if (!key) {
    throw new Error("AES_SECRET_KEY environment variable is not set");
  }
  return cryptoJs.AES.encrypt(plainText, key as string).toString();
};

export const decryption = ({
  cipherText,
  key = process.env.AES_SECRET_KEY,
}: DecryptionProps) => {
  if (!key) {
    throw new Error("AES_SECRET_KEY environment variable is not set");
  }
  if (!cipherText) {
    return cipherText;
  }
  return cryptoJs.AES.decrypt(cipherText, key as string).toString(
    cryptoJs.enc.Utf8,
  );
};

// node crypto native module without third party module
// import crypto from "crypto";
// import { existsSync, readFileSync, writeFileSync } from "fs";

// const IV_LENGTH = 16;

// const key = Buffer.from(process.env.AES_SECRET_KEY!);
// export const encrypt = (text: string) => {
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//   let encrypted = cipher.update(text, "utf-8", "hex");

//   encrypted += cipher.final("hex");
//   // return { iv: iv.toString("hex"), encryptedData: encrypted };
//   return `${iv.toString("hex")}:${encrypted}`;
// };

// export const decrypt = (encryptedText: string) => {
//   const [iv, encryptedData] = encryptedText.split(":");
//   const binary_iv = Buffer.from(iv, "hex");
//   const decipher = crypto.createDecipheriv("aes-256-cbc", key, binary_iv);
//   let decrypted = decipher.update(encryptedData, "hex", "utf-8");
//   decrypted += decipher.final("utf-8");
//   return decrypted;
// };

// // ==============================================================
// // Asysmetric Encryption
// if (!existsSync("public.pem") && !existsSync("private.pem")) {
//   const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
//     modulusLength: 2048,
//     publicKeyEncoding: {
//       type: "pkcs1",
//       format: "pem",
//     },
//     privateKeyEncoding: {
//       type: "pkcs1",
//       format: "pem",
//     },
//   });

//   writeFileSync("public.pem", publicKey);
//   writeFileSync("private.pem", privateKey);
// }
// export const encryptWithPublicKey = (text: string) => {
//   const publicKey = readFileSync("public.pem", "utf-8");
//   const bufferText = Buffer.from(text);
//   const encrypted = crypto.publicEncrypt(
//     {
//       key: publicKey,
//       padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//     },
//     bufferText,
//   );
//   return encrypted.toString("hex");
// };

// export const decryptWithPrivateKey = (encryptedText: string) => {
//   const privateKey = readFileSync("private.pem", "utf-8");
//   const bufferText = Buffer.from(encryptedText, "hex");
//   const decrypted = crypto.privateDecrypt(
//     {
//       key: privateKey,
//       padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//     },
//     bufferText,
//   );
//   return decrypted.toString("utf-8");
// };
