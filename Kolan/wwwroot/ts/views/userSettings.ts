import { View } from "../views/view";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";
import { themes } from "../themes/themes";
import { ThemeManager } from "../themes/themeManager";

window.addEventListener("load", () => new UserSettings());
declare const tempData;

class UserSettings extends View {
    constructor() {
        super();

        if (tempData["message"]) ToastController.new(tempData["message"], ToastType.Info);

        // Populate theme drop-down
        const themeSelect = document.getElementById("themeSelect") as HTMLSelectElement;
        for (const theme in themes) {
            const option = document.createElement("option");
            option.innerHTML = theme;
            option.value = theme;
            themeSelect.appendChild(option);
        }

        themeSelect.value = ThemeManager.getTheme();

        themeSelect.addEventListener("change", e => {
            const select = e.target as HTMLSelectElement;
            ThemeManager.setTheme(select.options[select.selectedIndex].value);
        });
    }
}
