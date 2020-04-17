import { IBoard } from "../models/IBoard";
import { ITask } from "../models/ITask";
import { Board } from "../views/board";
import { PasswordDialog } from "../dialogs/passwordDialog";
import { Crypto } from "./crypto";
import Dexie from "dexie";

const MarkdownIt = require("markdown-it")
const md = new MarkdownIt({ // Doing it the normal way does not work apparently!
    linkify: true
});

/**
 * Formatting text to be fit for display.
 */
export class ContentFormatter {
    private static markdownRenderer = md;
    private static db: Dexie;

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
        return this.getCryptoKey().then(cryptoKey => {
            let newValuePromises = [];
            let keys = [];
            for (const key in board) {
                if (key == "id") continue;

                const value = board[key];
                if (typeof value == "string") {
                    // func returns a promise, save each promise in an array so they can be unwrapped at the same time.
                    newValuePromises.push(func(value, cryptoKey));
                    keys.push(key); // Also save the key of the property that was formatted, to keep track of which promise belongs to which key
                }
            }

            return Promise.all(newValuePromises).then(newValues => {
                for (let i = 0; i < newValues.length; i++) board[keys[i]] = newValues[i];

                return board;
            })
        });
    }

    /**
    * Gets a board's cryptokey using the root board's id
    * If the key is not saved in the browser, the user will be prompted to enter the board password.
    */
    private static getCryptoKey(): Promise<any> {
        // Open database if it isn't already open.
        if (!ContentFormatter.db) {
            ContentFormatter.db = new Dexie("crypto");
            ContentFormatter.db.version(1).stores({
                cryptokeys: "&id"
            });
        }

        const db = ContentFormatter.db;
        const id = Board.ancestors.length > 0 ? Board.ancestors[0].id : Board.id;

        // Return the cryptokey if it exists in IndexDB, otherwise create one and add it to the db.
        return db.table("cryptokeys").get(id).then(result => {
            return result.key;
        }).catch(() => {
            // Prompt user for password
            const passwordDialog = new PasswordDialog("Enter board password", "Done");
            passwordDialog.shown = true;
            document.body.appendChild(passwordDialog);

            // Creating a promise here will make it wait for the submitDialog event to fire.
            return new Promise((resolve, reject) => {
                passwordDialog.addEventListener("submitDialog", (e: CustomEvent) => {
                    // Create cryptokey using the password provided by the user
                    Crypto.createKey(e.detail.output["password"], id).then(key => {
                        db.table("cryptokeys").put({
                            id: id,
                            key: key
                        });

                        passwordDialog.remove();

                        resolve(key);
                    });
                });
            });
        });
    }

    private static toBase64(input: ArrayBuffer): string {
        return btoa(new Uint8Array(input).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    }
}
