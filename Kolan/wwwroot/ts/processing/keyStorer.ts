import Dexie from "dexie";

export class KeyStorer {
    private db: Dexie = new Dexie("crypto");

    constructor() {
        this.db.version(1).stores({
            cryptoKeys: "&type"
        });
    }

    public set(type: string, cryptoKey: CryptoKey): Promise<any> {
        return this.db.table("cryptoKeys").put({
            type: type,
            key: cryptoKey
        });
    }

    public async get(type: string): Promise<CryptoKey> {
        const result = await this.db.table("cryptoKeys").get(type);

        return result.key;
    }

    public clear(): Promise<any> {
        return this.db.table("cryptoKeys").clear();
    }
}
