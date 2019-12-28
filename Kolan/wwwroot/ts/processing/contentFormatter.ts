const MarkdownIt = require("markdown-it")
const md = new MarkdownIt({ // Doing it the normal way does not work apparently!
    linkify: true
});
const DOMPurify = require("dompurify");

/**
 * Formatting text to be fit for display.
 */
export class ContentFormatter {
    private static markdownRenderer = md;

    /**
     * Converts markdown to HTML while keeping it safe from XSS attacks.
     *
     * @name formatWithMarkdown
     * @function
     * @static
     * @param {string} input
     * @returns {string}
     */
    public static formatWithMarkdown(input: string): string {
        return this.markdownRenderer.render(input);
    }

    /**
     * Makes the input safe for use, preventing XSS attacks.
     *
     * @name format
     * @static
     * @param {string} input
     * @returns {string}
     */
    public static format(input: string): string {
        return DOMPurify.sanitize(input); // TODO: Don't only sanitize!
    }
}
