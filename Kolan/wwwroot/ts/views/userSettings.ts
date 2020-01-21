import { View } from "../views/view";
import { DropDown } from "../components/dropDown";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";
import { themes } from "../themes/themes";
import { ThemeManager } from "../themes/themeManager";

window.addEventListener("load", () => new UserSettings());
declare const tempData;

class UserSettings extends View {
    constructor() {
        super();

        new DropDown(); // The drop down won't work without this, and I don't know why!

        if (tempData["message"]) ToastController.new(tempData["message"], ToastType.Info);

        // Populate theme drop-down
        const themeSelect = document.getElementById("themeSelect") as DropDown;
        themeSelect.items = themes;
        themeSelect.value = ThemeManager.getTheme();

        themeSelect.addEventListener("change", e => {
            const dropdown = e.target as DropDown;
            ThemeManager.setTheme(dropdown.value);
            location.reload();
        });
    }
}
