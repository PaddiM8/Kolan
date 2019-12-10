"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialogBox_1 = require("./components/dialogBox");
const addTaskDialog_1 = require("./dialogs/addTaskDialog");
const shareDialog_1 = require("./dialogs/shareDialog");
const tasklistController_1 = require("./controllers/tasklistController");
const apiRequester_1 = require("./apiRequester");
const requestParameter_1 = require("./requestParameter");
const boardHubConnection_1 = require("./communication/boardHubConnection");
window.addEventListener("load", () => new Board());
class Board {
    constructor() {
        // Prepare addTaskDialog
        let addDialogElement = new dialogBox_1.DialogBox(addTaskDialog_1.addTaskDialog, "addTaskDialog");
        document.body.appendChild(addDialogElement);
        addDialogElement.addEventListener("submitDialog", (e) => this.addTask(this._currentTasklist, e.detail.name, e.detail.description));
        // Prepare shareDialog
        let shareDialogElement = new dialogBox_1.DialogBox(shareDialog_1.shareDialog, "shareDialog");
        document.body.appendChild(shareDialogElement);
        shareDialogElement.addEventListener("itemAdded", (e) => // User added in the share dialog
         this.handleUserAdded(e.detail));
        shareDialogElement.addEventListener("itemRemoved", (e) => // User removed in the share dialog
         this.handleUserRemoved(e.detail));
        // Load board
        this.loadBoard();
        // Events
        const plusElements = document.getElementsByClassName("plus");
        for (let plus of plusElements) {
            plus.addEventListener("click", e => {
                const groupName = e.currentTarget.parentElement.dataset.name;
                addDialogElement.shown = true;
                addDialogElement.dialogOptions.requestMethod = viewData.id;
                addDialogElement.extraRequestParameters = [
                    new requestParameter_1.RequestParameter("groupName", groupName)
                ];
                const item = e.currentTarget.parentElement;
                const taskListId = [...item.parentElement.children].indexOf(item);
                this._currentTasklist = document
                    .getElementsByTagName("tasklist")[taskListId];
            });
        }
        const shareButton = document.getElementById("shareButton");
        shareButton.addEventListener("click", e => shareDialogElement.shown = true);
        // Websockets
        new boardHubConnection_1.BoardHubConnection(viewData.id);
    }
    addTask(tasklist, name, description) {
        const tasklistController = new tasklistController_1.TasklistController(tasklist);
        tasklistController.addTask(name, description);
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
        new apiRequester_1.ApiRequester().send("Board", viewData.id, "GET").then(result => {
            const boards = JSON.parse(result.toString());
            for (const item of boards) {
                this.addTask(item.board.group, item.board.name, item.board.description);
            }
        });
    }
}
