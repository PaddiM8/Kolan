import { DialogBox } from "../components/dialogBox"
import { addTaskDialog } from "../dialogs/addTaskDialog";
import { editTaskDialog } from "../dialogs/editTaskDialog";
import { shareDialog } from "../dialogs/shareDialog";
import { setupDialog } from "../dialogs/setupDialog";
import { TasklistController } from "../controllers/tasklistController";
import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter"
import { BoardHubConnection } from "../communication/boardHubConnection";
import { ITask } from "../models/ITask";
import { IGroup } from "../models/IGroup";
import { ToastType } from "../enums/toastType";
import { ToastNotif } from "../components/toastNotif";

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
        new BoardHubConnection(Board.viewData.id);
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

                Board.dialogs.addTask.shown = true;
                Board.dialogs.addTask.dialogOptions.requestMethod = Board.viewData.id;
                Board.dialogs.addTask.extraRequestParameters = [ 
                    new RequestParameter("groupId", groupId)
                ];

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

    private onUserAdded(username: string): void {
        const requestParameters: RequestParameter[] = [ new RequestParameter("username", username) ];
        new ApiRequester().send("Boards", `${Board.viewData.id}/Users`, "POST", requestParameters);
    }

    private onUserRemoved(username: string): void {
        const requestParameters = [ new RequestParameter("username", username) ];
        new ApiRequester().send("Boards", `${Board.viewData.id}/Users`, "DELETE", requestParameters);
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
            "addTask": new DialogBox(addTaskDialog, "addTaskDialog"),
            "editTask": new DialogBox(editTaskDialog, "editTaskDialog"),
            "share": new DialogBox(shareDialog, "shareDialog"),
            "setup": new DialogBox(setupDialog, "setupDialog"),
        }

        // addTaskDialog
        dialogs.addTask.dialogOptions.requestMethod = Board.viewData.id + "/" +
            dialogs.addTask.dialogOptions.requestMethod;
        document.body.appendChild(dialogs.addTask);

        // addTaskDialog
        dialogs.editTask.dialogOptions.requestMethod = Board.viewData.id + "/" +
            dialogs.editTask.dialogOptions.requestMethod;
        document.body.appendChild(dialogs.editTask);

        // Prepare shareDialog
        document.body.appendChild(dialogs.share);
        dialogs.share.addEventListener("itemAdded", (e: CustomEvent) => // User added in the share dialog
            this.onUserAdded(e.detail));
        dialogs.share.addEventListener("itemRemoved", (e: CustomEvent) => // User removed in the share dialog
            this.onUserRemoved(e.detail));
        dialogs.share.addEventListener("openDialog", () => {
            // Get collaborators
            new ApiRequester().send("Boards", Board.viewData.id + "/Users", "GET").then(result => {
                const users: string[] = JSON.parse(result as string);
                dialogs.share.list.items = users;
            });
        });

        // Prepare setupDialog
        dialogs.setup.dialogOptions.requestMethod = Board.viewData.id + "/" +
            dialogs.setup.dialogOptions.requestMethod;
        document.body.appendChild(dialogs.setup);

        dialogs.setup.addEventListener("submitDialog", (e: CustomEvent) => {
            for (const group of e.detail.output)
                this.addGroup(group);
        });

        Board.dialogs = dialogs;
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
        new ApiRequester().send("Boards", Board.viewData.id, "GET").then(result => {
            const boardContent = JSON.parse(result as string);

            // Set title on the client side, both on the board page and in the document title.
            this.setTitle(boardContent.board.name, boardContent.ancestors);

            // If the request returns nothing, the board hasn't been set up yet. Display the setup dialog.
            if (!boardContent.groups) {
                Board.dialogs.setup.shown = true;
                return;
            }

            const tasklists = document.getElementById("tasklists");
            for (const groupObject of boardContent.groups) {
                this.addGroup(groupObject.group);

                for (const board of groupObject.boards)
                    this.addTask(groupObject.group.id, board);
            }

            document.body.appendChild(new ToastNotif("Loaded board", ToastType.Info));
        }).catch((req) => {
            if (req.status == 404) this.setTitle("404 - Board does not exist", []);
            console.log(req);
        });
    }
}
