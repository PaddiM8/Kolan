import { ThemeManager } from "../themes/themeManager";

export class View {
    constructor() {
        ThemeManager.injectStyle();
    }
}
