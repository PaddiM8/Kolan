import { ToastNotif } from "../components/toastNotif";
import { ToastType } from "../enums/toastType";

export class ToastController {
    public new(message: string, type: ToastType): void {
        document.body.appendChild(new ToastNotif(message, type));
    }
}
