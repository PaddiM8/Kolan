"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialogBox_1 = require("./components/dialogBox");
const addTaskDialog_1 = require("./dialogs/addTaskDialog");
const tasklistController_1 = require("./controllers/tasklistController");
window.addEventListener("load", () => new Board());
class Board {
    constructor() {
        // Prepare dialog
        let addDialog = new dialogBox_1.DialogBox(addTaskDialog_1.addTaskDialog, "addTaskDialog");
        document.body.appendChild(addDialog);
        addDialog.addEventListener("submitDialog", (e) => this.addTask(this._currentTasklist, e.detail.title, e.detail.description));
        // Events
        const plusElements = document.getElementsByClassName("plus");
        for (let plus of plusElements) {
            plus.addEventListener("click", e => {
                addDialog.shown = true;
                const item = e.currentTarget.parentElement;
                const taskListId = [...item.parentElement.children].indexOf(item);
                this._currentTasklist = document
                    .getElementsByTagName("tasklist")[taskListId];
            });
        }
    }
    addTask(tasklist, title, description) {
        const tasklistController = new tasklistController_1.TasklistController(tasklist);
        tasklistController.addTask(title, description);
    }
}
