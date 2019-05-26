"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./components/draggableElement");
const boardListController_1 = require("./controllers/boardListController");
window.addEventListener("load", () => new Boards().initiate());
class Boards {
    initiate() {
        document.getElementById("addBoard").addEventListener("click", this.onAddBoardClick);
    }
    onAddBoardClick() {
        const boardListController = new boardListController_1.BoardListController(document
            .querySelector(".board-list tasklist"));
        boardListController.addBoard("Name", "Description", "#6163dd");
    }
    ;
}
