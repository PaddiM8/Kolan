export class ThemeManager {
    /**
    * Find and inject the enabled theme to the page.
    */
    public static injectStyle(): void {
        if (!this.getTheme()) {
            document.body.insertAdjacentHTML("beforeend", "<div id='themeTester' aria-hidden></div>");
            const style = window.getComputedStyle(document.getElementById("themeTester"))

            if (style.getPropertyValue("background-color") == "rgba(0, 0, 0, 0)") {
                this.setTheme("dark");
            } else {
                this.setTheme("light");
            }
        }

        document.head.insertAdjacentHTML("beforeend", this.getStyle());
    }

    /**
    * Get the HTML used to link to the theme stylesheet.
    */
    public static getStyle(): string {
        const themeName = this.getTheme();
        return `<link rel="stylesheet" type="text/css" href="/css/themes/${themeName}.css">`;
    }

    /**
    * Set the theme, using the theme name
    */
    public static setTheme(themeName): void {
        window.localStorage.setItem("theme", themeName);
    }

    /**
    * Get the name of the currently enabled theme
    */
    public static getTheme(): string {
        return window.localStorage.getItem("theme");
    }
}
