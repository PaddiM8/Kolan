export class ThemeManager {
    public static setToPreferedTheme() {
        if (this.getTheme()) return; // Theme already set
        const style = window.getComputedStyle(document.getElementById("themeTester"))

        if (style.getPropertyValue("background-color") == "rgba(0, 0, 0, 0)") {
            this.setTheme("dark");
        } else {
            this.setTheme("light");
        }
    }

    /**
    * Set the theme using the theme name
    */
    public static setTheme(themeName: string): void {
        document.cookie = "theme=" + themeName;
    }

    /**
    * Get the name of the currently enabled theme
    */
    public static getTheme(): string {
        return this.getCookie("theme");
    }

    private static getCookie(name: string) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
      }
}
