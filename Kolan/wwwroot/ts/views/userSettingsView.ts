import { View } from "./view";
import { DropDown } from "../components/dropDown";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";
import { themes } from "../themes/themes";
import { ThemeManager } from "../themes/themeManager";
import { PasswordDialog } from "../dialogs/passwordDialog";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";

window.addEventListener("load", () => new UserSettingsView());
declare const viewData;
declare const tempData;

class UserSettingsView extends View {
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

        // Remove user
        const removeUserButton = document.getElementById("removeUserButton");
        removeUserButton.addEventListener("click", () => {
            const dialog = new PasswordDialog("Confirm password to delete (this will remove ALL your boards)", "Delete");
            document.body.appendChild(dialog);
            dialog.shown = true;

            dialog.addEventListener("submitDialog", (e: CustomEvent) => {
                this.removeUser(e.detail.output["password"]);
            });
        });
    }

    private async removeUser(password: string): Promise<void> {
        await ApiRequester.send("Users", viewData.username, RequestType.Delete, {
            password: password
        });

        location.href = "/Logout";
    }
}
