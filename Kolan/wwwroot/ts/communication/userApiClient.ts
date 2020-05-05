import { ApiClient } from "./apiClient";
import { RequestType } from "../enums/requestType";
import { RSAType } from "../processing/crypto";
import { Crypto } from "../processing/crypto";
import { RedirectTo } from "../views/redirectTo";

export class UserApiClient extends ApiClient {
    public async add(email: string, username: string, password: string, repeatPassword: string): Promise<string> {
        // Create the user's public/private key pair. This will also save the keys locally.
        // These will be used do encrypt/decrypt boards' encryption keys.
        const keyPair = await Crypto.createWrappingKeyPair(password, username);

        return this.send("Users", "Create", RequestType.Post, {
            email: email,
            username: username,
            password: password,
            repeatPassword: repeatPassword,
            publicKey: await Crypto.exportRSAKey(keyPair.publicKey),
            privateKey: await Crypto.wrapPrivateKey(keyPair.privateKey)
        })
    }

    public async delete(username: string, password: string): Promise<void> {
        await this.send("Users", username, RequestType.Delete, {
            password: password
        });
    }

    public async getPublicKey(username: string): Promise<CryptoKey> {
        const response = await this.send("Users", `${username}/PublicKey`, RequestType.Get);

        return await Crypto.importRSAKey(JSON.parse(response).key, RSAType.Public);
    }

    public async logout(): Promise<void> {
        await Crypto.clearKeys();
        RedirectTo.Logout();
    }
}