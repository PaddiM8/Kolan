import "../components/components";
import { View } from "./view";
import { BoardListController } from "../controllers/boardListController";
import { ApiRequester } from "../communication/apiRequester";
import { Board } from "../models/board";
import { RequestType } from "../enums/requestType";
import { AddBoardDialog } from "../dialogs/addBoardDialog";
import { Crypto } from "../processing/crypto";
import { ContentFormatter } from "../processing/contentFormatter";

window.addEventListener("load", () => new BoardsView());
declare const viewData;

class BoardsView extends View {
    /**
     * Add event listeners, dialogs that will be used, and more (on page load)
     */
    constructor() {
        super();

        // Prepare dialog
        let addDialog = new AddBoardDialog();
        document.body.appendChild(addDialog);

        // Load boards
        this.loadBoards();

        // Events
        document.getElementById("addBoard").addEventListener("click", () =>
            addDialog.shown = true);

        document.getElementById("logoutButton").addEventListener("click", () => {
            // Remove the stored keys and logout
            Crypto.clearKeys().then(() => location.href = "/Logout");
        });
    }

    /**
     * Load the list of boards from the backend.
     */
    private async loadBoards(): Promise<void> {
        const boardListController = new BoardListController(document
            .querySelector(".board-list .draggableContainer"));

        const result = await ApiRequester.send("Boards", "", RequestType.Get);
        const jsonObj = JSON.parse(result as string);

        // Import/unwrap and save the RSA keys. These will be used to wrap/unwrap board encryption keys.
        Crypto.setRSAKeys(jsonObj.keys.publicKey, jsonObj.keys.privateKey);

        for (const boardData of jsonObj.boards) {
            // If the current user does not own the board, the encryption key saved on the board itself won't work,
            // Use the encryption key meant for the current user, instead.
            if (!boardData.owned) boardData.board.encryptionKey = boardData.encryptionKeyIfShared;

            // Encryption and such, if needed
            const processedBoard = await new Board(boardData.board).processPostBackend()
            boardListController.addBoardToBottom(processedBoard);
        }
    }
}
