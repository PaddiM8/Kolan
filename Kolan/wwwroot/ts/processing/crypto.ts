const base64 = require("byte-base64");
import { KeyStorer } from "./keyStorer"

export class Crypto {
    private static encoder = new TextEncoder();
    private static decoder = new TextDecoder("utf-8");
    private static keyStorer = new KeyStorer();

    /**
    * Create a CryptoKey used to (un)wrap other keys.
    */
    public static createWrappingKey(password: string, salt: string): Promise<CryptoKey> {
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
                    "iterations": 50000,
                    "hash": "SHA-256"
                },
                importedKey,
                {
                    "name": "AES-KW",
                    "length": 256
                },
                false,
                ["wrapKey", "unwrapKey"]
            );
        }) as Promise<CryptoKey>;
    }

    public static createRandomKey(salt: string): Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        ) as Promise<CryptoKey>;
    }

    public static setWrappingKey(password: string, salt: string): Promise<any> {
        return Crypto.createWrappingKey(password, salt).then(cryptoKey => {
            return Crypto.keyStorer.clear().then(() => {
                return Crypto.keyStorer.set("wrappingKey", cryptoKey);
            });
        });
    }

    public static wrapKey(keyToWrap: CryptoKey): Promise<string> {
        return Crypto.keyStorer.get("wrappingKey").then(wrappingKey => {
            return crypto.subtle.wrapKey(
                "raw",
                keyToWrap,
                wrappingKey,
                "AES-KW"
            ).then(wrappedKey => {
                return base64.bytesToBase64(new Uint8Array(wrappedKey));
            });
        }) as Promise<string>;
    }

    public static unwrapKey(keyToUnwrap: string): Promise<CryptoKey> {
        return Crypto.keyStorer.get("wrappingKey").then(wrappingKey => {
            return crypto.subtle.unwrapKey(
                "raw",
                base64.base64ToBytes(keyToUnwrap),
                wrappingKey,
                "AES-KW",
                "AES-GCM",
                true,
                ["encrypt", "decrypt"]
            );
        }) as Promise<CryptoKey>;
    }

    public static importKey(key: string): Promise<CryptoKey> {
        return crypto.subtle.importKey(
            "raw",
            Crypto.encoder.encode(key),
            "AES-GCM",
            true,
            ["encrypt", "decrypt"]
        ) as Promise<CryptoKey>;
    }

    /**
    * Encrypt a string.
    */
    public static encrypt(input: string, key: CryptoKey): Promise<string> {
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
        }) as Promise<string>;
    }

    /**
    * Decrypt a string.
    */
    public static decrypt(input: string, key: CryptoKey): Promise<string> {
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
        }) as Promise<string>;
    }
}
