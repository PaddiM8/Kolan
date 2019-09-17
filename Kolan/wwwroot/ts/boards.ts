import "./components/components";
import { BoardListController } from "./controllers/boardListController";
import { addBoardDialog } from "./dialogs/addBoardDialog";
import { DialogBox } from "./components/dialogBox";
import { ApiRequester } from "./apiRequester";

window.addEventListener("load", () => new Boards());

class Boards {
    /**
     * Add event listeners, dialogs that will be used, and more (on page load)
     */
    constructor() {
        // Prepare dialog
        let addDialog = new DialogBox(addBoardDialog, "addBoardDialog");
        document.body.appendChild(addDialog);
        addDialog.addEventListener("submitDialog", (e: CustomEvent) =>
            this.addBoardItem(e.detail.name, e.detail.description));

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
    private addBoardItem(name, description) {
        const boardListController = new BoardListController(document
            .querySelector(".board-list tasklist"));
        boardListController.addBoard(name, description);
    }

    private loadBoards()
    {
        new ApiRequester().send("Boards", "", "GET").then(result => {
            const boards = JSON.parse(result.toString());
            for (const item of boards) {
                this.addBoardItem(item.board.name, item.board.description);
            }
        });
    }
}
