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
        let board = new Board( this.getFormData());

        if (board.encrypted) {
            const emptyBoard = new Board();
            emptyBoard.name = "-"; // Some name is mandatory

            // Create an empty board for now, and get its id. It will be updated it with encrypted data afterwards.
            const response = await ApiRequester.send("Boards", "", RequestType.Post, emptyBoard);
            const id = JSON.parse(response)["id"];

            // Create the board's encryption key
            const cryptoKey = await Crypto.createRandomKey(id);
            const portableKey = await Crypto.wrapKey(cryptoKey);
            board.encryptionKey = portableKey;

            // Update board with encrypted data, now that we have the id.
            const encryptedBoard = await board.processPreBackend();
            encryptedBoard.id = id;

            try {
                await ApiRequester.send("Boards", id, RequestType.Put, {
                    parentId: null,
                    newBoardContent: JSON.stringify(encryptedBoard)
                });

                let groupNames = [];
                for (const groupName of Defaults.groupNames)
                    groupNames.push(await ContentFormatter.preBackend(groupName, cryptoKey));
    
                await ApiRequester.send("Boards", `${id}/Setup`, RequestType.Post, {
                    groups: JSON.stringify(groupNames)
                });

                location.href = `/Board/${id}`;
            } catch (err) {
                this.showErrors(JSON.parse(err.response))
            }
        } else {
            // Send http request
            try {
                const response = await ApiRequester.send("Boards", "", RequestType.Post, board as Board);
                const output = JSON.parse(response);
    
                // Setup board
                await ApiRequester.send("Boards", `${output["id"]}/Setup`, RequestType.Post, {
                    groups: JSON.stringify(Defaults.groupNames)
                });
    
                location.href = `/Board/${output["id"]}`
            } catch(err) {
                this.showErrors(err.response);
            };
        }
    }
}
