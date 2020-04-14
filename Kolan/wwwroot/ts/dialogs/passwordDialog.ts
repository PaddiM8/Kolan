import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";

@customElement("password-dialog")
export class PasswordDialog extends DialogBox {
    @property({type: String}) groupId;
    @property({type: Array<object>()}) fields = [
        {
            key: "password",
            value: "Password",
            placeholder: "Enter password...",
            inputType: InputType.Password,
        }
    ];
    @property({type: Object}) options = {
        title: "",
        primaryButton: ""
    }

    constructor(message: string, buttonText: string) {
        super();
        this.options.title = message;
        this.options.primaryButton = buttonText;
    }
}
