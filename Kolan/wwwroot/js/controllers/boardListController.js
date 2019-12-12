"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiRequester_1 = require("../communication/apiRequester");
const requestParameter_1 = require("../communication/requestParameter");
/**
 * Controller to add/remove/edit/etc. items in a board list.
 */
class BoardListController {
    constructor(boardlist) {
        this._boardlist = boardlist;
    }
    /**
     * Add a board to the top of the list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    addBoard(id, name, description, color = "") {
        const item = this.createBoard(id, name, description, color);
        this._boardlist.insertBefore(item, this._boardlist.firstElementChild); // Insert at top
    }
    /**
     * Add a board to the bottom of the list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    addBoardToBottom(id, name, description, color = "") {
        const item = this.createBoard(id, name, description, color);
        this._boardlist.appendChild(item); // Insert at bottom
    }
    createBoard(id, name, description, color = "") {
        const item = document.createElement("draggable-element");
        item.dataset.id = id;
        item.insertAdjacentHTML("beforeend", `<span class="dragger"></span><h2>${name}</h2><p>${description}</p>`);
        if (color != "")
            item.style.backgroundColor = color;
        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("taskInternalMove", e => this.onInternalMove(e.target, e["detail"]["toItem"]), false);
        return item;
    }
    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        window.location.href = "../Board/" + e.target.dataset.id;
    }
    onInternalMove(item, toItem) {
        var target;
        if (toItem)
            target = toItem.dataset.id;
        else
            target = viewData.username; // If there is no item above, set the target to the user's username.
        new apiRequester_1.ApiRequester().send("Boards", "ChangeOrder", "POST", [
            new requestParameter_1.RequestParameter("boardId", item.dataset.id),
            new requestParameter_1.RequestParameter("targetId", target)
        ]);
    }
}
exports.BoardListController = BoardListController;
