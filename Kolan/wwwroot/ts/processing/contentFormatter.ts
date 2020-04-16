const MarkdownIt = require("markdown-it")
const md = new MarkdownIt({ // Doing it the normal way does not work apparently!
    linkify: true
});
//const DOMPurify = require("dompurify");

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
     * Does the formatting needed after being received from the backend.
     */
    public static postBackend(input: string): string {
        if (!input) return "";

        return input.substring(3, input.length - 3);
    }

    /*
    * Does the formatting needed before being sent off to the backend.
    */
    public static preBackend(input: string) {
        if (!input) return "";

        return "!!!" + input + "!!!";
    }

    /**
     * Formats the string fields of an object using the given function
     */
    public static object<T>(input: T, func: Function, excludeFields: string[] = []): T {
        let data = input;
        for (const key in data) {
            if (excludeFields.includes(key)) continue;

            const value = data[key];
            if (typeof value == "string") {
                data[key] = func(value);
            }
        }

        return data;
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
}
