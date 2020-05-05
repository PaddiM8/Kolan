import { DialogBox } from "../components/dialogBox";
import { property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { ApiRequester } from "../communication/apiRequester";
import { ContentFormatter } from "../processing/contentFormatter";
import { Task } from "../models/task";
import { Crypto } from "../processing/crypto";
import { Defaults } from "../defaults";
import { DialogOptions, DialogField } from "../models/dialogOptions";

@customElement("add-board-dialog")
export class AddBoardDialog extends DialogBox {
    @property({type: Array<Object>()}) fields: DialogField[] = [
        {
            key: "name",
            value: "Board name",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Board description",
            inputType: InputType.Text
        },
        {
            key: "encrypted",
            value: "Encrypted",
            inputType: InputType.Checkbox,
        }
    ];
    @property({type: Object}) options: DialogOptions = {
        title: "Add Board",
        primaryButton: "Add"
    }

    async submitHandler(): Promise<void> {
        let board = new Task(this.getFormData());
       
        try {
            // Send the board to the backend, and retrieve the id created for it.
            const id = await ApiRequester.boards.add(board);

            // Redirect to the board.
            location.href = `/Board/${id}`;
        } catch (err) {
            // Show model errors.
            this.showErrors(err.response);
        }
    }
}
