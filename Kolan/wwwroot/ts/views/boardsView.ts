import "../components/components";
import { View } from "./view";
import { BoardListController } from "../controllers/boardListController";
import { ApiRequester } from "../communication/apiRequester";
import { Task } from "../models/task";
import { RequestType } from "../enums/requestType";
import { AddBoardDialog } from "../dialogs/addBoardDialog";
import { Crypto } from "../processing/crypto";

window.addEventListener("load", () => new BoardsView());

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
            ApiRequester.users.logout();
        });
    }

    /**
     * Load the list of boards from the backend.
     */
    private async loadBoards(): Promise<void> {
        const boardListController = new BoardListController(document
            .querySelector(".board-list .draggableContainer"));

        const result = await ApiRequester.boards.getAll();
        for (const board of result.boards) {
            boardListController.addBoardToBottom(board);
        }
    }
}
