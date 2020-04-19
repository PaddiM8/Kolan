import { IBoard } from "../models/IBoard";
import { ITask } from "../models/ITask";
import { PasswordDialog } from "../dialogs/passwordDialog";
import { Crypto } from "./crypto";
import { KeyStorer } from "./keyStorer";

const MarkdownIt = require("markdown-it")
const md = new MarkdownIt({ // Doing it the normal way does not work apparently!
    linkify: true
});

/**
 * Formatting text to be fit for display.
 */
export class ContentFormatter {
    private static markdownRenderer = md;
    private static keyStorer = new KeyStorer();

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
    /*public static board(board: IBoard | ITask, func: Function, rootId: string = null): Promise<IBoard | ITask> {
        if (board.encrypted) {
            return Crypto.unwrapKey(board.encryptionKey).then(cryptoKey => {
                return this.boardFields(board, func, cryptoKey);
            });
        }

        // If no cryptokey is provided, it will not attempt to encrypt/decrypt it.
        return this.boardFields(board, func, null);
    }*/

    public static boardPreBackend(board: IBoard | ITask, rootId: string = null): Promise<IBoard | ITask> {
        if (board.encrypted) {
            return Crypto.unwrapKey(board.encryptionKey).then(cryptoKey => {
                return this.boardFields(board, this.preBackend, cryptoKey);
            });
        }

        return this.boardFields(board, this.preBackend, null);
    }

    public static boardPostBackend(board: IBoard | ITask, rootId: string = null): Promise<IBoard | ITask> {
        if (board.encrypted) {
            return Crypto.unwrapKey(board.encryptionKey).then(cryptoKey => {
                return this.boardFields(board, this.postBackend, cryptoKey);
            });
        }

        return this.boardFields(board, this.postBackend, null);
    }

    private static boardFields(inputBoard: IBoard | ITask, func: Function, cryptoKey?: CryptoKey): Promise<IBoard | ITask> {
        let board = Object.assign({}, inputBoard); // Clone the object before editing it
        let newValuePromises = [];
        let keys = [];

        for (const key in board) {
            if (key == "id" || key == "encryptionKey") continue;
            if (key == "onTop") delete board[key];

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
    }

    /**
    * Gets a board's cryptokey using the root board's id
    * If the key is not saved in the browser, the user will be prompted to enter the board password.
    */
    /*private static getCryptoKey(board: IBoard | ITask, id: string): Promise<CryptoKey> {
        // If the board has an encryption key already, import it so that it can be used
        if (board.encryptionKey) {
            return Crypto.importKey(board.encryptionKey);
        }

        // Otherwise generate a new random encryption key that will be used for encrypting everything inside the board
        return Crypto.createRandomKey(id);
    }*/
}
