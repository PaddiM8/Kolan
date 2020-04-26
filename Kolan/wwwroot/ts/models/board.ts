import { Crypto } from "../processing/crypto";
import { ContentFormatter } from "../processing/contentFormatter";

export class Board {
    public id: string;
    public name: string;
    public description: string;
    public encrypted: boolean;
    public encryptionKey?: string;
    public public?: boolean;
    public tags?: string;

    // Making sure the crypto key doesn't get converted to JSON and such, while still being accessible.
    private _cryptoKey: CryptoKey;
    public get cryptoKey(): CryptoKey {
        return this._cryptoKey;
    }

    constructor(obj?: object, cryptoKey?: CryptoKey) {
        if (obj) Object.assign(this, obj);
        if (cryptoKey) this._cryptoKey = cryptoKey;
    }

    /**
     * Prepare for being sent off to the backend
     */
    public async processPreBackend(): Promise<Board> {
        await this.process(ContentFormatter.preBackend);

        return this;
    }

    /**
     * Process after having received it from the backend
     */
    public async processPostBackend(): Promise<Board> {
        await this.process(ContentFormatter.postBackend);

        return this;
    }

    protected async process(func: Function): Promise<void> {
        // If encryption is disabled and there is no crypto key in the object yet, set this._cryptoKey to a cryptokey.
        if (this.encrypted && !this.cryptoKey) {
            this._cryptoKey = await Crypto.unwrapEncryptionKey(this.encryptionKey);
        }

        for (const key in this) {
            if (key == "id" || key == "encryptionKey") continue;
            if (key == "onTop") delete this[key];

            // Process each object item one at a time
            const value = this[key];
            if (typeof value == "string") {
                this[key] = await func(value, this.cryptoKey);
            }
        }
    }
}