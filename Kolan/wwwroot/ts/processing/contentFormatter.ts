import { Board } from "../models/board";
import { Task } from "../models/task";
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
                resolve(input); // TODO: sanitize?
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
}
