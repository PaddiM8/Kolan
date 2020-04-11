export class ThemeManager {
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

    public static getStyle(): string {
        const themeName = this.getTheme();
        return `<link rel="stylesheet" type="text/css" href="/css/themes/${themeName}.css">`;
    }

    public static setTheme(themeName): void {
        window.localStorage.setItem("theme", themeName);
    }

    public static getTheme(): string {
        return window.localStorage.getItem("theme");
    }
}
