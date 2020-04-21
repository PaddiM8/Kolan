import { DialogBox } from "../components/dialogBox";
import { property, customElement } from "lit-element";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";
import { BoardView } from "../views/boardView";

@customElement("setup-dialog")
export class SetupDialog extends DialogBox {
    @property({type: Array<object>()}) fields = [];
    @property({type: Object}) options = {
        title: "Setup Board",
        primaryButton: "Continue"
    }

    async submitHandler(): Promise<void> {
        const response = await ApiRequester.send("Boards", `${BoardView.id}/Setup`, RequestType.Post, {
            groups: "[]" // Let the backend automatically provide the groups
        });

        this.dispatchEvent(new CustomEvent("submitDialog", {
            detail: {
                output: JSON.parse(response)
            }
        }));

        this.hide();
    }

    cancelHandler(): void {
        history.back();
    }
}
