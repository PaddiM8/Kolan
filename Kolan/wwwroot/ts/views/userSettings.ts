import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";

window.addEventListener("load", () => new UserSettings());
declare const tempData;

class UserSettings {
    constructor() {
        if (tempData["message"]) ToastController.new(tempData["message"], ToastType.Info);
    }
}
