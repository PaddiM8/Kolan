import "../components/components";
import { BoardListController } from "../controllers/boardListController";
import { DialogBox } from "../components/dialogBox";
import { ApiRequester } from "../communication/apiRequester";
import { IBoard } from "../models/IBoard";
import { RequestType } from "../enums/requestType";
import { AddBoardDialog } from "../dialogs/addBoardDialog";

window.addEventListener("load", () => new Boards());

class Boards {
    /**
     * Add event listeners, dialogs that will be used, and more (on page load)
     */
    constructor() {
        // Prepare dialog
        let addDialog = new AddBoardDialog();
        document.body.appendChild(addDialog);
        addDialog.addEventListener("submitDialog", (e: CustomEvent) => {
            const board: IBoard = {
                id: e.detail.output.id,
                name: e.detail.input.name,
                description: e.detail.input.description
            };

            this.addBoardItem(board);
        });

        // Load boards
        this.loadBoards();

        // Events
        document.getElementById("addBoard").addEventListener("click", () =>
            addDialog.shown = true);
    }

    /** Adds a board item
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     */
    private addBoardItem(board: IBoard): void {
        const boardListController = new BoardListController(document
            .querySelector(".board-list .draggableContainer"));
        boardListController.addBoard(board);
    }

    /**
     * Load the list of boards from the backend.
     */
    private loadBoards(): void {
        const boardListController = new BoardListController(document
            .querySelector(".board-list .draggableContainer"));

        new ApiRequester().send("Boards", "", RequestType.Get).then(result => {
            const boards = JSON.parse(result as string);
            for (const item of boards) {
                if (item.board.id) {
                    boardListController.addBoardToBottom(item.board);
                } else if (item.shared.id) {
                    boardListController.addBoardToBottom(item.shared);
                }
            }
        });
    }
}
