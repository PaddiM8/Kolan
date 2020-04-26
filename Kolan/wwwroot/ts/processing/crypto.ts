const base64 = require("byte-base64");
import { KeyStorer } from "./keyStorer"

export enum RSAType {
    Public,
    Private
}

export class Crypto {
    private static encoder = new TextEncoder();
    private static decoder = new TextDecoder("utf-8");
    private static keyStorer = new KeyStorer();

    //
    // Wrapping key-pair - Public/private key-pair used to (un)wrap encryption keys.
    //

    public static async createWrappingKeyPair(password: string, salt: string): Promise<CryptoKeyPair> {
        const key = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // TODO: 
                hash: { name: "SHA-256" },
            },
            true,
            ["wrapKey", "unwrapKey"]
        );

        await Crypto.setWrappingKey(password, salt);

        return key;
    }

    public static async setRSAKeys(publicKey: string, privateKey: string): Promise<void> {
        const importedPublic = await Crypto.importRSAKey(publicKey, RSAType.Public);
        const unwrappedPrivate = await Crypto.unwrapPrivateKey(privateKey);
        await Crypto.keyStorer.set("publicKey", importedPublic);
        await Crypto.keyStorer.set("privateKey", unwrappedPrivate);
    }

    public static async wrapPrivateKey(keyToWrap: CryptoKey): Promise<string> {
        return Crypto.encrypt(
            await Crypto.exportRSAKey(keyToWrap),
            await Crypto.keyStorer.get("privateKeyWrapper") as CryptoKey
        );
    }

    public static async unwrapPrivateKey(keyToUnwrap: string): Promise<CryptoKey> {
        const decrypted = await Crypto.decrypt(
            keyToUnwrap,
            await Crypto.keyStorer.get("privateKeyWrapper") as CryptoKey
        );

        return await Crypto.importRSAKey(decrypted, RSAType.Private);
    }

    public static importRSAKey(key: string, type: RSAType): Promise<CryptoKey> {
        return crypto.subtle.importKey(
            "jwk",
            (JSON.parse(atob(key))),
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" }
            },
            true,
            [ type == RSAType.Public ? "wrapKey" : "unwrapKey" ]
        ) as Promise<CryptoKey>;
    }

    public static async exportRSAKey(key: CryptoKey): Promise<string> {
        return btoa(JSON.stringify(await crypto.subtle.exportKey("jwk", key)));
    }

    //
    // Wrapping key - Used to (un)wrap other keys.
    //

    /**
    * Create a CryptoKey used to (un)wrap other keys.
    */

    public static async setWrappingKey(password: string, salt: string): Promise<void> {
        await Crypto.keyStorer.clear(); // TODO: Don't clear here...
        //const cryptoKey = await Crypto.createEncryptionKeyWrapper(password, salt);
        const importedKey = await crypto.subtle.importKey(
            "raw",
            Crypto.encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );
        const algo = {
            "name": "PBKDF2",
            "salt": Crypto.encoder.encode(salt),
            "iterations": 50000,
            "hash": "SHA-256"
        };

        Crypto.keyStorer.set("passwordBasedKeyBase", importedKey);
        Crypto.keyStorer.set("privateKeyWrapper", await crypto.subtle.deriveKey(
                algo,
                importedKey,
                {
                    "name": "AES-GCM",
                    "length": 256
                },
                false,
                ["encrypt", "decrypt"]
            )
        );
    }

    //
    // Encryption key - Key used to encrypt/decrypt data.
    //

    public static createEncryptionKey(): Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        ) as Promise<CryptoKey>;
    }

    public static async unwrapEncryptionKey(keyToUnwrap: string): Promise<CryptoKey> {
        return crypto.subtle.unwrapKey(
            "raw",
            base64.base64ToBytes(keyToUnwrap),
            await Crypto.keyStorer.get("privateKey") as CryptoKey,
            "RSA-OAEP",
            "AES-GCM",
            true,
            ["encrypt", "decrypt"]
        );
    }

    public static importEncryptionKey(key: string): Promise<CryptoKey> {
        return crypto.subtle.importKey(
            "raw",
            Crypto.encoder.encode(key),
            "AES-GCM",
            true,
            ["encrypt", "decrypt"]
        ) as Promise<CryptoKey>;
    }

    //
    // General functions
    //

    public static async wrapAnyKey(keyToWrap: CryptoKey, wrappingKey?: CryptoKey): Promise<string> {
        // If a wrapping key is not specified, the key storer should have it.
        if (!wrappingKey) wrappingKey = await Crypto.keyStorer.get("publicKey") as CryptoKey;

        let wrapAlgo;
        if (wrappingKey.algorithm.name == "AES-KW") {
            wrapAlgo = "AES-KW";
        } else if (wrappingKey.algorithm.name == "RSA-OAEP") {
            wrapAlgo = {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" }
            };
        }

        const wrappedKey = await crypto.subtle.wrapKey(
            "raw",
            keyToWrap,
            wrappingKey as CryptoKey,
            wrapAlgo
        );

        return base64.bytesToBase64(new Uint8Array(wrappedKey));
    }

    /**
     * Remove all the stored keys locally, this should be done when for example logging out.
     */
    public static async clearKeys(): Promise<void> {
        await Crypto.keyStorer.clear();
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
    public static async decrypt(input: string, key: CryptoKey): Promise<string> {
        let encodedInput = base64.base64ToBytes(input); // Convert from base64 string to Uint8Array

        // Separate actual text to decrypt and iv
        const iv = encodedInput.slice(-12); // The iv is at the end of the array and has a size of 12
        encodedInput = encodedInput.slice(0, -12); // Get the array without the iv

        const arrBuf = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encodedInput
        );

        return Crypto.decoder.decode(arrBuf); // Convert ArrayBuffer to a string
    }
}
