import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptJSON = (obj: any): string => {
  return encrypt(JSON.stringify(obj));
};

export const decryptJSON = (ciphertext: string): any => {
  const decrypted = decrypt(ciphertext);
  return JSON.parse(decrypted);
};

