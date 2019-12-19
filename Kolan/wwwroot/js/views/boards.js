"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../components/components");
const boardListController_1 = require("../controllers/boardListController");
const addBoardDialog_1 = require("../dialogs/addBoardDialog");
const dialogBox_1 = require("../components/dialogBox");
const apiRequester_1 = require("../communication/apiRequester");
window.addEventListener("load", () => new Boards());
class Boards {
    /**
     * Add event listeners, dialogs that will be used, and more (on page load)
     */
    constructor() {
        // Prepare dialog
        let addDialog = new dialogBox_1.DialogBox(addBoardDialog_1.addBoardDialog, "addBoardDialog");
        document.body.appendChild(addDialog);
        addDialog.addEventListener("submitDialog", (e) => {
            const board = {
                id: e.detail.output.id,
                name: e.detail.input.name,
                description: e.detail.input.description
            };
            this.addBoardItem(board);
        });
        // Load boards
        this.loadBoards();
        // Events
        document.getElementById("addBoard").addEventListener("click", () => addDialog.shown = true);
    }
    /** Adds a board item
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     */
    addBoardItem(board) {
        const boardListController = new boardListController_1.BoardListController(document
            .querySelector(".board-list tasklist"));
        boardListController.addBoard(board);
    }
    /**
     * Load the list of boards from the backend.
     */
    loadBoards() {
        const boardListController = new boardListController_1.BoardListController(document
            .querySelector(".board-list tasklist"));
        new apiRequester_1.ApiRequester().send("Boards", "", "GET").then(result => {
            const boards = JSON.parse(result);
            for (const item of boards) {
                boardListController.addBoardToBottom(item);
            }
        });
    }
}
