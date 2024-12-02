import {nanoid, customAlphabet} from "nanoid";
import { nolookalikesSafe } from 'nanoid-dictionary';
require('dotenv').config();
import crypto from 'crypto';
import logger from "../logger/logger";

const hashLogger = logger.child({context:'hashService'})
const secretKey = crypto.createHash('sha256').update(process.env.URL_SHORTENER as string).digest();

const hashHandler = {
    encrypt: (id: string) => {
        try {
            const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
            const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
            let encrypted = cipher.update(id, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            hashLogger.info('Data encryption successful!')
            // Combine iv and encrypted string to return
            return iv.toString('hex') + ':' + encrypted;
        } catch( error ) {
            hashLogger.error('Data encryption unsuccessful!', {error: error})
        }

    },

    decrypt: (encryptedData: string) => {
        try {
            // Split the IV and the encrypted data
            const [ivHex, encryptedId] = encryptedData.split(':');
            const iv = Buffer.from(ivHex, 'hex'); // Convert the IV from hex to buffer

            const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
            let decrypted = decipher.update(encryptedId, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            hashLogger.info('Data decryption successful!')
            return decrypted;
        } catch (error) {
            hashLogger.error(`Data decryption unsuccessful!
            error: ${error},
            encrypted data: ${encryptedData},
            key: ${secretKey.toString('hex')}`
                , {error: error})
        }

    },

    urlShortener: (hashedUrl: string) => {
        const shortenedUrl = customAlphabet(nolookalikesSafe, 12)
        // const base62 = Base62Str.createInstance();
        // const randomBytes = crypto.randomBytes(6).toString('hex'); // Add entropy
        // return base62.encodeStr(Buffer.from(hashedUrl+randomBytes).toString()); // Combine and encode
    }
};

export default hashHandler;
