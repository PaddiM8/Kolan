import { IBoard } from "../models/IBoard";
import { ITask } from "../models/ITask";
import { Crypto } from "./crypto";

const MarkdownIt = require("markdown-it")
const md = new MarkdownIt({ // Doing it the normal way does not work apparently!
    linkify: true
});

/**
 * Formatting text to be fit for display.
 */
export class ContentFormatter {
    private static markdownRenderer = md;
    /*private indexedDB: IDBDatabase;

    constructor() {
        const request = window.indexedDB.open("crypto", 1);

        request.onupgradeneeded = (e: any) => {
            console.log("hi");
            this.indexedDB = e.target.result;
            e.target.result.createObjectStore("boardCryptoKeys", { keyPath: "boardId" });
        };
    }*/

    /**
     * Converts markdown to HTML
     */
    public static markdown(input: string): string {
        if (!input) return "";

        return this.markdownRenderer.render(input);
    }

    /**
    * Takes a date-number and creates a formatted date string showing the date.
    */
    public static date(date: number): string {
        return new Date(date).toLocaleString(undefined, {
            year: "numeric",
            month: "numeric",
            day: "numeric"
        });
    }

    /**
     * Does the formatting needed after being received from the backend.
     */
    public static postBackend(input: string, cryptoKey?: CryptoKey): Promise<string> {
        return new Promise((resolve, reject) => {
            if (input && cryptoKey) {
                Crypto.decrypt(input, cryptoKey).then(decryptedString => {
                    resolve(decryptedString);
                });
            } else {
                resolve(input);
            }
        });
    }

    /*
    * Does the formatting needed before being sent off to the backend.
    */
    public static preBackend(input: string, cryptoKey?: CryptoKey): Promise<string> {
        return new Promise((resolve, reject) => {
            if (input && cryptoKey) {
                Crypto.encrypt(input, cryptoKey).then(encryptedString => {
                    resolve(encryptedString);
                });
            } else {
                resolve(input);
            }
        });
    }

    /**
     * Formats the string fields of an object using the given function
     */
    public static board(board: ITask, func: Function): Promise<ITask> {
        return this.getCryptoKey(board.id).then(cryptoKey => {
            let newValuePromises = [];
            let keys = [];
            for (const key in board) {
                if (key == "id") continue;

                const value = board[key];
                if (typeof value == "string") {
                    newValuePromises.push(func(value, cryptoKey));
                    keys.push(key);
                }
            }

            return Promise.all(newValuePromises).then(newValues => {
                for (let i = 0; i < newValues.length; i++) board[keys[i]] = newValues[i];

                return board;
            })
        }).catch(err => { console.log(err); return undefined; });
    }

    private static getCryptoKey(id: string): Promise<CryptoKey> {
        return Crypto.createKey("password", "salt") as Promise<CryptoKey>;
        /*const key = localStorage.getItem("key_" + id);
        if (!key) return Crypto.createKey("password", "salt") as Promise<CryptoKey>;

        return new Promise((resolve, reject) => {
            resolve(JSON.parse(key));
        });*/
        /*const objectStore = this.indexedDB.transaction("cryptoKeys", "readwrite")
            .objectStore("cryptoKeys");
        const keyObj = objectStore.get(id);

        if (!keyObj) {
            const key = Crypto.createKey("password", "x");
            objectStore.add({
                id: id,
                cryptoKey: key
            })

            return key;
        }

        return keyObj.result.cryptoKey;*/
    }

    private static toBase64(input: ArrayBuffer): string {
        return btoa(new Uint8Array(input).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    }
}
