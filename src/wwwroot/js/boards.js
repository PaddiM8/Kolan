"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./components/draggableElement");
require("./components/dialogBox");
const boardListController_1 = require("./controllers/boardListController");
const addBoardDialog_1 = require("./dialogs/addBoardDialog");
window.addEventListener("load", () => new Boards().initiate());
class Boards {
    initiate() {
        document.getElementById("addBoard").addEventListener("click", this.onAddBoardClick);
    }
    onAddBoardClick() {
        // Show dialog box
        const dialog = document.createElement("dialog-box");
        dialog.inputs = addBoardDialog_1.addBoardDialog;
        document.body.appendChild(dialog);
        // Add board item to list
        const boardListController = new boardListController_1.BoardListController(document
            .querySelector(".board-list tasklist"));
        boardListController.addBoard("Name", "Description");
    }
    ;
}
