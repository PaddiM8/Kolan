import { ToastNotif } from "../components/toastNotif";
import { ToastType } from "../enums/toastType";

/**
* Controller for creating new toast messages.
*/
export class ToastController {
    public static new(message: string, type: ToastType, persistent: Boolean = false): ToastNotif {
        const toast = new ToastNotif(message, type, persistent);
        document.body.appendChild(toast);

        return toast;
    }
}
