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
    addBoard(board) {
        const item = this.createBoard(board);
        this._boardlist.insertBefore(item, this._boardlist.firstElementChild); // Insert at top
    }
    /**
     * Add a board to the bottom of the list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    addBoardToBottom(board) {
        const item = this.createBoard(board);
        this._boardlist.appendChild(item); // Insert at bottom
    }
    /**
     * Create a board item without placing it
     * @param id Board id
     * @param name Board name
     * @param description Board description
     * @param color Optional board color
     */
    createBoard(board) {
        const item = document.createElement("draggable-element");
        item.dataset.id = board.id;
        item.insertAdjacentHTML("beforeend", `<span class="dragger"></span><h2>${board.name}</h2><p>${board.description}</p>`);
        if (board.color != "")
            item.style.backgroundColor = board.color;
        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("taskInternalMove", e => this.onInternalMove(e.target, e["detail"]["toItem"]), false);
        return item;
    }
    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        const target = e.target;
        window.location.href = "../Board/" + target.dataset.id;
    }
    /**
     * Fires when the board item was moved in the list.
     * @param item   {HTMLElement} Item being moved
     * @param toItem {HTMLElement} The item above it in the new location
     */
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
