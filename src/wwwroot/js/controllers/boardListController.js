"use strict";
/**
 * Controller to add/remove/edit/etc. items in a board list.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
    addBoard(name, description, color) {
        const item = document.createElement("draggable-element");
        item.insertAdjacentHTML("beforeend", `<h2>${name}</h2><p>${description}</p>`);
        item.style.backgroundColor = color;
        this._boardlist.appendChild(item);
    }
}
exports.BoardListController = BoardListController;
