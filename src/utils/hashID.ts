import crypto from 'crypto';
import logger from "../logger/logger";
require('dotenv').config();
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
            hashLogger.info('Data encryption unsuccessful!', {error: error})
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
            hashLogger.info('Data decryption unsuccessful!', {error: error})
        }

    }
};

export default hashHandler;
