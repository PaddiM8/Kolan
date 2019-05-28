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
    addBoard(name, description, color = "") {
        const item = document.createElement("draggable-element");
        item.insertAdjacentHTML("beforeend", `<span class="dragger"></span><h2>${name}</h2><p>${description}</p>`);
        if (color != "")
            item.style.backgroundColor = color;
        this._boardlist.appendChild(item);
        item.addEventListener("click", (e) => this.onClickEvent(e));
    }
    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        const draggerUnder = document.elementsFromPoint(e.clientX, e.clientY)
            .filter(x => x.classList.contains("dragger"));
        if (draggerUnder.length > 0)
            return;
        alert("clicked");
    }
}
exports.BoardListController = BoardListController;
