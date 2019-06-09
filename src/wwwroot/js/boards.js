"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./components/components");
const boardListController_1 = require("./controllers/boardListController");
const addBoardDialog_1 = require("./dialogs/addBoardDialog");
const dialogBox_1 = require("./components/dialogBox");
window.addEventListener("load", () => new Boards());
class Boards {
    /**
     * Add event listeners, dialogs that will be used, and more (on page load)
     */
    constructor() {
        // Prepare dialog
        let addDialog = new dialogBox_1.DialogBox(addBoardDialog_1.addBoardDialog, "addBoardDialog");
        document.body.appendChild(addDialog);
        addDialog.addEventListener("submitDialog", (e) => this.addBoardItem(e.detail.name, e.detail.description));
        // Events
        document.getElementById("addBoard").addEventListener("click", () => addDialog.shown = true);
    }
    /** Adds a board item
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     */
    addBoardItem(name, description) {
        const boardListController = new boardListController_1.BoardListController(document
            .querySelector(".board-list tasklist"));
        boardListController.addBoard(name, description);
    }
}
