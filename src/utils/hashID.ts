// @ts-ignore
import * as CryptoJS from "crypto-js"
require('dotenv').config()
import crypto from 'crypto';

// const secretKey = process.env.URL_SHORTENER as string;
// console.log(secretKey)
const secretKey = crypto.randomBytes(32);  // 256-bit key
const iv = crypto.randomBytes(16);

const hashHandler = {

    encrypt : (id: string) => {

        const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
        let encrypted = cipher.update(id, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },

    decrypt : (encryptedId: string) => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
        let decrypted = decipher.update(encryptedId, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

}
export default hashHandler