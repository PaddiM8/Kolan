import "../components/components";
import { View } from "./view";
import { BoardListController } from "../controllers/boardListController";
import { ApiRequester } from "../communication/apiRequester";
import { Board } from "../models/board";
import { RequestType } from "../enums/requestType";
import { AddBoardDialog } from "../dialogs/addBoardDialog";

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
    }

    /**
     * Load the list of boards from the backend.
     */
    private async loadBoards(): Promise<void> {
        const boardListController = new BoardListController(document
            .querySelector(".board-list .draggableContainer"));

        const result = await ApiRequester.send("Boards", "", RequestType.Get);
        const boards = JSON.parse(result as string);
        for (const board of boards) {
            const processedBoard = await new Board(board).processPostBackend()
            boardListController.addBoardToBottom(processedBoard);
        }
    }
}
