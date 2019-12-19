declare const viewData;

import { DialogBox } from "../components/dialogBox"
import { addTaskDialog } from "../dialogs/addTaskDialog";
import { shareDialog } from "../dialogs/shareDialog";
import { setupDialog } from "../dialogs/setupDialog";
import { TasklistController } from "../controllers/tasklistController";
import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter"
import { BoardHubConnection } from "../communication/boardHubConnection";
import { ITask } from "../models/ITask";
import { IGroup } from "../models/IGroup";

window.addEventListener("load", () => new Board());

export let tasklistControllers = {};

class Board {
    private currentTasklistId: string;
    private setupDialogElement: DialogBox;
    private addDialogElement: DialogBox;

    constructor() {
        // Prepare addTaskDialog
        this.addDialogElement = new DialogBox(addTaskDialog, "addTaskDialog");

        this.addDialogElement.dialogOptions.requestMethod = viewData.id + "/" +
            this.addDialogElement.dialogOptions.requestMethod;
        document.body.appendChild(this.addDialogElement);

        // Prepare shareDialog
        let shareDialogElement = new DialogBox(shareDialog, "shareDialog");

        document.body.appendChild(shareDialogElement);
        shareDialogElement.addEventListener("itemAdded", (e: CustomEvent) => // User added in the share dialog
            this.onUserAdded(e.detail));
        shareDialogElement.addEventListener("itemRemoved", (e: CustomEvent) => // User removed in the share dialog
            this.onUserRemoved(e.detail));

        // Prepare setupDialog
        this.setupDialogElement = new DialogBox(setupDialog, "setupDialog");

        this.setupDialogElement.dialogOptions.requestMethod = viewData.id + "/" +
            this.setupDialogElement.dialogOptions.requestMethod;
        document.body.appendChild(this.setupDialogElement);

        this.setupDialogElement.addEventListener("submitDialog", (e: CustomEvent) => {
            for (const group of e.detail.output)
                this.addGroup(group);
        });

        // Load board
        this.loadBoard();

        const shareButton = document.getElementById("shareButton");
        shareButton.addEventListener("click", e => shareDialogElement.shown = true)

        // Websockets
        new BoardHubConnection(viewData.id);
    }

    /**
     * Add a group to the client side.
     * @param id Group id
     * @param name Group name
     */
    addGroup(group: IGroup)
    {
        const listhead = document.getElementById("list-head");
        listhead.insertAdjacentHTML("beforeend",
            `<div class="item" data-id="${group.id}">
                ${group.name}
                <span class="plus"><span>+</span></span>
            </div>`);

        const tasklists = document.getElementById("tasklists");
        const tasklistElement = document.createElement("tasklist");
        tasklistElement.dataset.id = group.id;
        tasklists.appendChild(tasklistElement);
        tasklistControllers[group.id] = new TasklistController(tasklistElement);

        // Events
        const plusElements = listhead.getElementsByClassName("plus");
        for (let plus of <any>plusElements) {
            plus.addEventListener("click", e => {
                const groupId = e.currentTarget.parentElement.dataset.id;

                this.addDialogElement.shown = true;
                this.addDialogElement.dialogOptions.requestMethod = viewData.id;
                this.addDialogElement.extraRequestParameters = [ 
                    new RequestParameter("groupId", groupId)
                ];

                this.currentTasklistId = groupId;
            });
        }
    }

    /**
     * Add a task (board) to the client side.
     * @param tasklistId Id of group
     * @param id Board id
     * @param name Board name
     * @param description Board description
     * @param toTop Add to the top of the list or not
     */
    addTask(tasklistId: string, task: ITask, toTop = true) {
        const tasklist: HTMLElement = document.querySelector(`#tasklists tasklist[data-id='${tasklistId}']`);
        const tasklistController: TasklistController = tasklistControllers[tasklistId];
        if (toTop) tasklistController.addTask(task);
        else       tasklistController.addTaskToBottom(task);
    }

    onUserAdded(username: string) {
        const requestParameters: RequestParameter[] = [ new RequestParameter("username", username) ];
        new ApiRequester().send("Boards", `${viewData.id}/Users`, "POST", requestParameters);
    }

    onUserRemoved(username: string) {
        const requestParameters = [ new RequestParameter("username", username) ];
        new ApiRequester().send("Boards", `${viewData.id}/Users`, "DELETE", requestParameters);
    }

    /**
     * Load the contents of the board from the backend.
     */
    loadBoard()
    {
        new ApiRequester().send("Boards", viewData.id, "GET").then(result => {
            const boards = JSON.parse(result as string);

            // If the request returns nothing, the board hasn't been set up yet. Display the setup dialog.
            if (boards.length == 0) {
                this.setupDialogElement.shown = true;
            } else {
                const tasklists = document.getElementById("tasklists");
                for (const item of boards) {
                    // Add group if it doesn't exist
                    if (!tasklists.querySelector(`tasklist[data-id="${item.group.id}"]`)) {
                        this.addGroup(item.group);
                    }

                    // Add board if it isn't null
                    if (item.board) this.addTask(item.group.id, item.board, false);
                }
            }

        }).catch((err) => console.log(err));
    }
}
