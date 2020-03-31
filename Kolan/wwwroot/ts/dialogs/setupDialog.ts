import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";

declare const viewData;

@customElement("setup-dialog")
export class SetupDialog extends DialogBox {
    @property({type: Array<object>()}) fields = [];
    @property({type: Object}) options = {
        title: "Setup Board",
        primaryButton: "Continue"
    }

    submitHandler(): void {
        const result = ApiRequester.send("Boards", `${viewData.id}/Setup`, RequestType.Post)
        .then((response) => {
            this.dispatchEvent(new CustomEvent("submitDialog", {
                detail: {
                    output: JSON.parse(response)
                }
            }));
        })
        .catch((err) => console.log(err));


        this.hide();
    }
}
