declare const viewData;

import { DialogBox } from "./components/dialogBox"
import { addTaskDialog } from "./dialogs/addTaskDialog";
import { shareDialog } from "./dialogs/shareDialog";
import { TasklistController } from "./controllers/tasklistController";
import { ApiRequester } from "./apiRequester";

window.addEventListener("load", () => new Board());

class Board {
    private _currentTasklist: Element;

    constructor() {
        // Prepare addTaskDialog
        let addDialogElement = new DialogBox(addTaskDialog, "addTaskDialog");
        document.body.appendChild(addDialogElement);
        addDialogElement.addEventListener("submitDialog", (e: CustomEvent) =>
            this.addTask(this._currentTasklist,
                e.detail.title,
                e.detail.description));

        // Prepare shareDialog
        let shareDialogElement = new DialogBox(shareDialog, "shareDialog");
        document.body.appendChild(shareDialogElement);

        // Load board
        this.loadBoard();

        // Events
        const plusElements = document.getElementsByClassName("plus");
        for (let plus of <any>plusElements) {
            plus.addEventListener("click", e => {
                addDialogElement.shown = true;
                const item = e.currentTarget.parentElement;
                const taskListId = [...item.parentElement.children].indexOf(item);
                this._currentTasklist = document
                    .getElementsByTagName("tasklist")[taskListId];
            });
        }

        const shareButton = document.getElementById("shareButton");
        shareButton.addEventListener("click", e => shareDialogElement.shown = true)
    }

    addTask(tasklist, title, description) {
        const tasklistController = new TasklistController(tasklist);
        tasklistController.addTask(title, description);
    }

    private loadBoard()
    {
        new ApiRequester().send("Board", viewData.id, "GET").then(result => {
            const boards = JSON.parse(result.toString());
            for (const item of boards) {
                this.addTask(item.board.group, item.board.name, item.board.description);
            }
        });
    }
}
