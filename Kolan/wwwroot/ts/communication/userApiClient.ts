import { ApiClient } from "./apiClient";
import { RequestType } from "../enums/requestType";
import { RSAType } from "../processing/crypto";
import { Crypto } from "../processing/crypto";

export class UserApiClient extends ApiClient {
    public add(email: string, username: string, password: string, repeatPassword: string, publicKey: string, privateKey: string): Promise<string> {
        return this.send("Users", "Create", RequestType.Post, {
            email: email,
            username: username,
            password: password,
            repeatPassword: repeatPassword,
            publicKey: publicKey,
            privateKey: privateKey
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
}