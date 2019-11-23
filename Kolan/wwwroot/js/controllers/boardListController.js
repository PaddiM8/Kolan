"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiRequester_1 = require("../apiRequester");
const requestParameter_1 = require("../requestParameter");
/**
 * Controller to add/remove/edit/etc. items in a board list.
 */
class BoardListController {
    constructor(boardlist) {
        this._boardlist = boardlist;
    }
    /**
     * Add a board to the board list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    addBoard(id, name, description, color = "") {
        const item = document.createElement("draggable-element");
        item["boardId"] = id;
        item.insertAdjacentHTML("beforeend", `<span class="dragger"></span><h2>${name}</h2><p>${description}</p>`);
        if (color != "")
            item.style.backgroundColor = color;
        this._boardlist.appendChild(item);
        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("taskInternalMove", e => this.onInternalMove(e["detail"]["fromIndex"], e["detail"]["toIndex"]), false);
    }
    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        window.location.href = "../Board/" + e.srcElement.boardId;
    }
    onInternalMove(fromIndex, toIndex) {
        new apiRequester_1.ApiRequester().send("Boards", "ChangeOrder", "POST", [
            new requestParameter_1.RequestParameter("fromIndex", fromIndex),
            new requestParameter_1.RequestParameter("toIndex", toIndex)
        ]);
    }
}
exports.BoardListController = BoardListController;
