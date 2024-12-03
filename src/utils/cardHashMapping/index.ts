import * as crypto from "crypto";

const hashHandler = {
    createSHA256Hash: async (inputString: string) => {
        const hash = crypto.createHash('sha256');
        hash.update(inputString)
        return hash.digest('hex')
    }
}

export default hashHandler