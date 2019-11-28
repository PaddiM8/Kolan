"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialogBox_1 = require("./components/dialogBox");
const addTaskDialog_1 = require("./dialogs/addTaskDialog");
const shareDialog_1 = require("./dialogs/shareDialog");
const tasklistController_1 = require("./controllers/tasklistController");
const apiRequester_1 = require("./apiRequester");
window.addEventListener("load", () => new Board());
class Board {
    constructor() {
        // Prepare addTaskDialog
        let addDialogElement = new dialogBox_1.DialogBox(addTaskDialog_1.addTaskDialog, "addTaskDialog");
        document.body.appendChild(addDialogElement);
        addDialogElement.addEventListener("submitDialog", (e) => this.addTask(this._currentTasklist, e.detail.title, e.detail.description));
        // Prepare shareDialog
        let shareDialogElement = new dialogBox_1.DialogBox(shareDialog_1.shareDialog, "shareDialog");
        document.body.appendChild(shareDialogElement);
        // Load board
        this.loadBoard();
        // Events
        const plusElements = document.getElementsByClassName("plus");
        for (let plus of plusElements) {
            plus.addEventListener("click", e => {
                addDialogElement.shown = true;
                const item = e.currentTarget.parentElement;
                const taskListId = [...item.parentElement.children].indexOf(item);
                this._currentTasklist = document
                    .getElementsByTagName("tasklist")[taskListId];
            });
        }
        const shareButton = document.getElementById("shareButton");
        shareButton.addEventListener("click", e => shareDialogElement.shown = true);
    }
    addTask(tasklist, title, description) {
        const tasklistController = new tasklistController_1.TasklistController(tasklist);
        tasklistController.addTask(title, description);
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
