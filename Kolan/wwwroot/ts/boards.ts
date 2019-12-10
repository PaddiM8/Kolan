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
            this.addBoardItem(e.detail.id, e.detail.name, e.detail.description));

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
    private addBoardItem(id, name, description) {
        const boardListController = new BoardListController(document
            .querySelector(".board-list tasklist"));
        boardListController.addBoard(id, name, description);
    }

    private loadBoards()
    {
        const boardListController = new BoardListController(document
            .querySelector(".board-list tasklist"));

        new ApiRequester().send("Boards", "", "GET").then(result => {
            const boards = JSON.parse(result as string);
            for (const item of boards) {
                boardListController.addBoardToBottom(item.id, item.name, item.description);
            }
        });
    }
}
