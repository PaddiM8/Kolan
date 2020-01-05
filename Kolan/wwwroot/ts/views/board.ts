import { DialogBox } from "../components/dialogBox"
import { InputList } from "../components/inputList"
import { TasklistController } from "../controllers/tasklistController";
import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter"
import { BoardHub } from "../communication/boardHub";
import { ITask } from "../models/ITask";
import { IGroup } from "../models/IGroup";
import { ToastType } from "../enums/toastType";
import { RequestType } from "../enums/requestType";
import { ToastNotif } from "../components/toastNotif";
import { ToastController } from "../controllers/toastController";

// Dialogs
import { AddTaskDialog } from "../dialogs/addTaskDialog";
import { EditTaskDialog } from "../dialogs/editTaskDialog";
import { ShareDialog } from "../dialogs/shareDialog";
import { SetupDialog } from "../dialogs/setupDialog";

window.addEventListener("load", () => new Board());
declare const viewData;

/**
 * In charge of controlling the "Board" page.
 * @name Board
 * @function
 */
export class Board {
    static dialogs;
    static tasklistControllers = {};
    static viewData;
    static pageReloadInProgress = false;
    private currentTasklistId: string;

    constructor() {
        Board.viewData = viewData;

        // Load dialogs
        this.loadDialogs();

        // Load board
        this.loadBoard();

        const shareButton = document.getElementById("shareButton");
        shareButton.addEventListener("click", e => Board.dialogs.share.shown = true)

        // Websockets
        new BoardHub().join(Board.viewData.id);

        window.onbeforeunload = () => {
            Board.pageReloadInProgress = true;
            return;
        }
    }

    /**
     * Add a group to the client side.
     * @param id Group id
     * @param name Group name
     */
    private addGroup(group: IGroup): void {
        const listhead = document.getElementById("list-head");
        listhead.insertAdjacentHTML("beforeend",
            `<div class="item" data-id="${group.id}">
                ${group.name}
                <span class="plus">+</span>
            </div>`);

        const tasklists = document.getElementById("tasklists");
        const tasklistElement = document.createElement("tasklist");
        tasklistElement.className = "draggableContainer";
        tasklistElement.dataset.id = group.id;
        tasklists.appendChild(tasklistElement);
        Board.tasklistControllers[group.id] = new TasklistController(tasklistElement);

        // Events
        const plusElements = listhead.getElementsByClassName("plus");
        for (let plus of <any>plusElements) {
            plus.addEventListener("click", e => {
                const groupId = e.currentTarget.parentElement.dataset.id;
                Board.dialogs["addTask"].shown = true;
                Board.dialogs["addTask"].groupId = groupId;
                //Board.dialogs.addTask.dialogOptions.requestMethod = Board.viewData.id;
                /*Board.dialogs.addTask.extraRequestParameters = [ 
                    new RequestParameter("groupId", groupId)
                ];*/

                this.currentTasklistId = groupId;
            });
        }
    }

    /**
     * Add a task (board) to the client side.
     *
     * @name addTask
     * @function
     * @param {string} tasklistId
     * @param {ITask} task
     * @param toTop=true
     * @returns {void}
     */
    private addTask(tasklistId: string, task: ITask): void {
        const tasklist: HTMLElement = document.querySelector(`#tasklists tasklist[data-id='${tasklistId}']`);
        const tasklistController: TasklistController = Board.tasklistControllers[tasklistId];
        tasklistController.addTask(task);
    }

    private onUserAdded(username: string, inputList: InputList): void {
        new ApiRequester().send("Boards", `${Board.viewData.id}/Users`, RequestType.Post, {
            username: username
        })
        .then(() => {
            ToastController.new("Collaborator added", ToastType.Info);
        })
        .catch(() => {
            ToastController.new("Failed to add collaborator", ToastType.Error);
            inputList.undo();
        });
    }

    private onUserRemoved(username: string): void {
        new ApiRequester().send("Boards", `${Board.viewData.id}/Users`, RequestType.Delete, {
            username: username
        });
    }

    /**
     * Prepare the dialogs for use, they are hidden by default. Simply update dialog.shown to show a dialog.
     *
     * @name loadDialogs
     * @function
     * @returns {void}
     */
    private loadDialogs(): void {
        const dialogs = {
            addTask: new AddTaskDialog(),
            editTask: new EditTaskDialog(),
            share: new ShareDialog()
        }

        for (const dialogName in dialogs) {
            document.body.appendChild(dialogs[dialogName]);
        }

        Board.dialogs = dialogs;

        /*const dialogs = {
            "addTask": new DialogBox(addTaskDialog, "addTaskDialog"),
            "editTask": new DialogBox(editTaskDialog, "editTaskDialog"),
            "share": new DialogBox(shareDialog, "shareDialog"),
            "setup": new DialogBox(setupDialog, "setupDialog"),
        }

        // addTaskDialog
        //dialogs.addTask.dialogOptions.requestMethod = Board.viewData.id + "/" +
            //dialogs.addTask.dialogOptions.requestMethod;
        document.body.appendChild(dialogs.addTask);

        // editTaskDialog
        //dialogs.editTask.dialogOptions.requestMethod = Board.viewData.id + "/" +
            //dialogs.editTask.dialogOptions.requestMethod;
        document.body.appendChild(dialogs.editTask);

        // Prepare shareDialog
        document.body.appendChild(dialogs.share);
        dialogs.share.addEventListener("itemAdded", (e: CustomEvent) => // User added in the share dialog
            this.onUserAdded(e.detail["value"], e.detail["object"]));
        dialogs.share.addEventListener("itemRemoved", (e: CustomEvent) => // User removed in the share dialog
            this.onUserRemoved(e.detail));
        dialogs.share.addEventListener("openDialog", () => {
            // Get collaborators
            new ApiRequester().send("Boards", Board.viewData.id + "/Users", RequestType.Get).then(result => {
                const users: string[] = JSON.parse(result as string);
                dialogs.share.list.items = users;
            });
        });

        // Prepare setupDialog
        (dialogs.setup.dialogOptions as IDialogHttpTemplate).requestMethod = Board.viewData.id + "/" +
            (dialogs.setup.dialogOptions as IDialogHttpTemplate).requestMethod;
        document.body.appendChild(dialogs.setup);

        dialogs.setup.addEventListener("submitDialog", (e: CustomEvent) => {
            for (const group of e.detail.output)
                this.addGroup(group);
        });

        Board.dialogs = dialogs;*/
    }

    private setTitle(title: string, ancestors: object[]) {
        document.title = title + " - Kolan";
        let html = `<a href="/">Boards</a> / `;

        // Ancestors
        for (let i = 0; i < ancestors.length; i++) {
            // If there are a lot of ancestors, hide the middle ones
            if (ancestors.length >= 5 && i == 1)
            {
                html += `<span>...</span> / `
                i = ancestors.length - 2;
                continue;
            }

            const ancestor = ancestors[ancestors.length - i - 1]; // Do backwards for correct order
            const name = ancestor["name"];
            const id = ancestor["id"];
            html += `<a href="./${id}">${name}</a> / `;
        }

        // Current board
        html += `<span>${title}</span>`;

        document.getElementById("title").insertAdjacentHTML("afterbegin", html);
    }

    /**
     * Load the contents of the board from the backend.
     *
     * @name loadBoard
     * @function
     * @returns {void}
     */
    private loadBoard(): void {
        const boardNameElement = document.getElementById("boardName");

        // Get board content
        new ApiRequester().send("Boards", Board.viewData.id, RequestType.Get).then(result => {
            const boardContent = JSON.parse(result as string);
            console.log(boardContent.ancestors);

            // Set title on the client side, both on the board page and in the document title.
            this.setTitle(boardContent.board.name, boardContent.ancestors);

            // If the request returns nothing, the board hasn't been set up yet. Display the setup dialog.
            if (!boardContent.groups) {
                const setupDialog = new SetupDialog();
                document.body.appendChild(setupDialog);
                setupDialog.shown = true;
                setupDialog.addEventListener("submitDialog", (e: CustomEvent) => {
                    for (const group of e.detail.output)
                        this.addGroup(group);
                });
                return;
            }

            const tasklists = document.getElementById("tasklists");
            for (const groupObject of boardContent.groups) {
                this.addGroup(groupObject.group);

                for (const board of groupObject.boards)
                    this.addTask(groupObject.group.id, board);
            }

            ToastController.new("Loaded board", ToastType.Info);
        }).catch((req) => {
            if (req.status == 404) this.setTitle("404 - Board does not exist", []);
            console.log(req);
        });
    }
}
