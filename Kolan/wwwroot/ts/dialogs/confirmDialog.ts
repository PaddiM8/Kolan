import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";

@customElement("confirm-dialog")
export class ConfirmDialog extends DialogBox {
    @property({type: String}) groupId;
    @property({type: Array<object>()}) fields = [];
    @property({type: Object}) options = {
        title: "",
        primaryButton: ""
    }

    constructor(message: string, buttonText: string) {
        super();
        this.options.title = message;
        this.options.primaryButton = buttonText;
    }

    onOpen(): void {
        const dialogElement = this.shadowRoot.querySelector(".dialog") as HTMLElement;
        const background = this.shadowRoot.querySelector(".dialogBackground") as HTMLElement;
        dialogElement.style.zIndex = "1002";
        background.style.zIndex = "1001";
    }
}
