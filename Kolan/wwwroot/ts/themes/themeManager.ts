export class ThemeManager {
    public static injectStyle(): void {
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
