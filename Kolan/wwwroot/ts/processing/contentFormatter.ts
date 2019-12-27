const MarkdownIt = require("markdown-it")
const md = new MarkdownIt({ // Doing it the normal way does not work apparently!
    linkify: true
});
const DOMPurify = require("dompurify");

export class ContentFormatter {
    private static markdownRenderer = md;

    public static formatWithMarkdown(input: string): string {
        return this.markdownRenderer.render(input);
    }

    public static format(input: string): string {
        return DOMPurify.sanitize(input);
    }
}
