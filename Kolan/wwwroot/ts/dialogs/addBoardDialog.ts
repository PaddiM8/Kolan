import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { RequestType } from "../enums/requestType";
import { ApiRequester } from "../communication/apiRequester";
import { ContentFormatter } from "../processing/contentFormatter";
import { Task } from "../models/task";
import { Board } from "../models/board";
import { Crypto } from "../processing/crypto";
import { Defaults } from "../defaults";

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
        },
        {
            key: "encrypted",
            value: "Encrypted",
            inputType: InputType.Checkbox,
        }
    ];
    @property({type: Object}) options = {
        title: "Add Board",
        primaryButton: "Add"
    }

    async submitHandler(): Promise<void> {
        let board = new Board(this.getFormData());

        // If encryption is enabled, create the board's encryption key and then wrap it to create an encrypted portable version of it.
        // It is then put on the board and sent to the backend (encrypted, of course).
        const cryptoKey = board.encrypted ? await Crypto.createEncryptionKey() : null;
        const portableKey = board.encrypted ? await Crypto.wrapAnyKey(cryptoKey) : null;
        board.encryptionKey = portableKey;

        // Process board data before sending it off to the backend.
        // This includes eg. encryption, if that is enabled on the board.
        const processedBoard = await board.processPreBackend();

        try {
            // Send the board to the backend, and retrieve the id created for it.
            const response = await ApiRequester.send("Boards", "", RequestType.Post, processedBoard);
            const id = JSON.parse(response)["id"];

            // Create a list of the default group names (and process them)
            let groupNames = [];
            for (const groupName of Defaults.groupNames)
                groupNames.push(await ContentFormatter.preBackend(groupName, cryptoKey));

            // Set up the board using the group names.
            await ApiRequester.send("Boards", `${id}/Setup`, RequestType.Post, {
                groups: JSON.stringify(groupNames)
            });

            // Redirect to the board.
            location.href = `/Board/${id}`;
        } catch (err) {
            // Show model errors.
            this.showErrors(JSON.parse(err.response))
        }
    }
}
