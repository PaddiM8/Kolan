import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { RequestType } from "../enums/requestType";
import { ApiRequester } from "../communication/apiRequester";

@customElement("add-board-dialog")
export class AddBoardDialog extends DialogBox {
    @property({type: Array<object>()}) fields = [
        {
            key: "name",
            value: "Board name",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Board description",
            inputType: InputType.Text
        }
    ];
    @property({type: Object}) options = {
        title: "Add Board",
        primaryButton: "Add"
    }

    submitHandler(): void {
        const board = this.getFormData();
        new ApiRequester().send("Boards", "", RequestType.Post, board).then((response) => {
            this.dispatchEvent(new CustomEvent("submitDialog", {
                detail: {
                    input: board,
                    output: JSON.parse(response)
                }
            }));

            this.hide();
        }).catch(err => {
            this.showErrors(err.response);
        });
    }
}
