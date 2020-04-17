const base64 = require("byte-base64");

export class Crypto {
    private static encoder = new TextEncoder();
    private static decoder = new TextDecoder("utf-8");

    /**
    * Create a CryptoKey used for encryption and decryption.
    */
    public static createKey(password: string, salt: string): PromiseLike<CryptoKey> {
        return crypto.subtle.importKey(
            "raw",
            Crypto.encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        ).then((importedKey) => {
            return crypto.subtle.deriveKey(
                {
                    "name": "PBKDF2",
                    "salt": Crypto.encoder.encode(salt),
                    "iterations": 20000,
                    "hash": "SHA-256"
                },
                importedKey,
                {
                    "name": "AES-GCM",
                    "length": 256
                },
                false,
                ["encrypt", "decrypt"]
            ).then(x => { return x; });
        });
    }

    /**
    * Encrypt a string.
    */
    public static encrypt(input: string, key: CryptoKey): PromiseLike<string> {
        const iv = crypto.getRandomValues(new Uint8Array(12));

        return crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            Crypto.encoder.encode(input)
        ).then(arrBuf => {
            // Combine the encrypted data and the iv
            let joined = new Uint8Array(arrBuf.byteLength + iv.byteLength);
            joined.set(new Uint8Array(arrBuf), 0);
            joined.set(iv, arrBuf.byteLength);

            return base64.bytesToBase64(joined); // Convert Uint8Array to a base64 string
        });
    }

    /**
    * Decrypt a string.
    */
    public static decrypt(input: string, key: CryptoKey): PromiseLike<string> {
        let encodedInput = base64.base64ToBytes(input); // Convert from base64 string to Uint8Array

        // Separate actual text to decrypt and iv
        const iv = encodedInput.slice(-12); // The iv is at the end of the array and has a size of 12
        encodedInput = encodedInput.slice(0, -12); // Get the array without the iv

        return crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encodedInput
        ).then(arrBuf => {
            return Crypto.decoder.decode(arrBuf); // Convert ArrayBuffer to a string
        });
    }
}
