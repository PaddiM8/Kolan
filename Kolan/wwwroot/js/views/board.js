"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialogBox_1 = require("../components/dialogBox");
const addTaskDialog_1 = require("../dialogs/addTaskDialog");
const shareDialog_1 = require("../dialogs/shareDialog");
const setupDialog_1 = require("../dialogs/setupDialog");
const tasklistController_1 = require("../controllers/tasklistController");
const apiRequester_1 = require("../communication/apiRequester");
const requestParameter_1 = require("../communication/requestParameter");
const boardHubConnection_1 = require("../communication/boardHubConnection");
window.addEventListener("load", () => new Board());
class Board {
    constructor() {
        // Prepare addTaskDialog
        this.addDialogElement = new dialogBox_1.DialogBox(addTaskDialog_1.addTaskDialog, "addTaskDialog");
        this.addDialogElement.dialogOptions.requestMethod = viewData.id + "/" +
            this.addDialogElement.dialogOptions.requestMethod;
        document.body.appendChild(this.addDialogElement);
        this.addDialogElement.addEventListener("submitDialog", (e) => this.addTask(this.currentTasklistId, e.detail.output.id, e.detail.input.name, e.detail.input.description));
        // Prepare shareDialog
        let shareDialogElement = new dialogBox_1.DialogBox(shareDialog_1.shareDialog, "shareDialog");
        document.body.appendChild(shareDialogElement);
        shareDialogElement.addEventListener("itemAdded", (e) => // User added in the share dialog
         this.handleUserAdded(e.detail));
        shareDialogElement.addEventListener("itemRemoved", (e) => // User removed in the share dialog
         this.handleUserRemoved(e.detail));
        // Prepare setupDialog
        this.setupDialogElement = new dialogBox_1.DialogBox(setupDialog_1.setupDialog, "setupDialog");
        this.setupDialogElement.dialogOptions.requestMethod = viewData.id + "/" +
            this.setupDialogElement.dialogOptions.requestMethod;
        document.body.appendChild(this.setupDialogElement);
        this.setupDialogElement.addEventListener("submitDialog", (e) => {
            for (const group of e.detail.output) {
                this.addGroup(group.id, group.name);
            }
        });
        // Load board
        this.loadBoard();
        const shareButton = document.getElementById("shareButton");
        shareButton.addEventListener("click", e => shareDialogElement.shown = true);
        // Websockets
        new boardHubConnection_1.BoardHubConnection(viewData.id);
    }
    addGroup(id, name) {
        const listhead = document.getElementById("list-head");
        listhead.insertAdjacentHTML("beforeend", `<div class="item" data-id="${id}">
                ${name}
                <span class="plus"><span>+</span></span>
            </div>`);
        const tasklists = document.getElementById("tasklists");
        const tasklistElement = document.createElement("tasklist");
        tasklistElement.dataset.id = id;
        tasklists.appendChild(tasklistElement);
        // Events
        const plusElements = listhead.getElementsByClassName("plus");
        for (let plus of plusElements) {
            plus.addEventListener("click", e => {
                const groupId = e.currentTarget.parentElement.dataset.id;
                this.addDialogElement.shown = true;
                this.addDialogElement.dialogOptions.requestMethod = viewData.id;
                this.addDialogElement.extraRequestParameters = [
                    new requestParameter_1.RequestParameter("groupId", groupId)
                ];
                this.currentTasklistId = groupId;
            });
        }
    }
    addTask(tasklistId, id, name, description, toTop = true) {
        const tasklist = document.querySelector(`#tasklists tasklist[data-id='${tasklistId}']`);
        const tasklistController = new tasklistController_1.TasklistController(tasklist);
        if (toTop)
            tasklistController.addTask(id, name, description);
        else
            tasklistController.addTaskToBottom(id, name, description);
    }
    handleUserAdded(username) {
        const requestParameters = [new requestParameter_1.RequestParameter("username", username)];
        new apiRequester_1.ApiRequester().send("Boards", `${viewData.id}/Users`, "POST", requestParameters);
    }
    handleUserRemoved(username) {
        const requestParameters = [new requestParameter_1.RequestParameter("username", username)];
        new apiRequester_1.ApiRequester().send("Boards", `${viewData.id}/Users`, "DELETE", requestParameters);
    }
    loadBoard() {
        new apiRequester_1.ApiRequester().send("Boards", viewData.id, "GET").then(result => {
            const boards = JSON.parse(result);
            // If the request returns nothing, the board hasn't been set up yet. Display the setup dialog.
            if (boards.length == 0) {
                this.setupDialogElement.shown = true;
            }
            else {
                const tasklists = document.getElementById("tasklists");
                for (const item of boards) {
                    // Add group if it doesn't exist
                    if (!tasklists.querySelector(`tasklist[data-id="${item.group.id}"]`)) {
                        this.addGroup(item.group.id, item.group.name);
                    }
                    // Add board if it isn't null
                    if (item.board)
                        this.addTask(item.group.id, item.board.id, item.board.name, item.board.description, false);
                }
            }
        }).catch((err) => console.log(err));
    }
}
