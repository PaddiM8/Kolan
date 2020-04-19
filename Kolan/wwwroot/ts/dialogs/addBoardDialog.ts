import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { RequestType } from "../enums/requestType";
import { ApiRequester } from "../communication/apiRequester";
import { ContentFormatter } from "../processing/contentFormatter";
import { ITask } from "../models/ITask";
import { IBoard } from "../models/IBoard";
import { Crypto } from "../processing/crypto";

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

    submitHandler(): void {
        let board = this.getFormData() as IBoard;

        if (board.encrypted) {
            const emptyBoard = { id: null, name: "-", description: null, encrypted: false };

            // Create an empty board for now, and get its id. It will be updated it with encrypted data afterwards.
            ApiRequester.send("Boards", "", RequestType.Post, emptyBoard).then(response => {
                const id = JSON.parse(response)["id"];

                // Create the board's encryption key
                Crypto.createRandomKey(id).then(cryptoKey => {
                    Crypto.wrapKey(cryptoKey).then(portableKey => {
                        board.encryptionKey = portableKey;

                        // Update board with encrypted data, now that we have the id.
                        ContentFormatter.boardPreBackend(board, id).then(encryptedBoard => {
                            encryptedBoard.id = id;

                            ApiRequester.send("Boards", id, RequestType.Put, {
                                parentId: null,
                                newBoardContent: JSON.stringify(encryptedBoard)
                            }).then(response => {
                                location.href = `/Board/${id}`;
                            }).catch(err => this.showErrors(JSON.parse(err.response)));
                        });
                    });
                });
            });
        } else {
            // Send http request
            ApiRequester.send("Boards", "", RequestType.Post, board as IBoard).then(response => {
                const output = JSON.parse(response);
                location.href = `/Board/${output["id"]}`;
            }).catch(err => {
                this.showErrors(err.response);
            });
        }
    }
}
