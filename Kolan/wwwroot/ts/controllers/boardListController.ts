declare const viewData;

import { ApiRequester } from "../apiRequester";
import { RequestParameter } from "../requestParameter";

/**
 * Controller to add/remove/edit/etc. items in a board list.
 */

export class BoardListController {
    private _boardlist: Element;

    constructor(boardlist: Element) {
        this._boardlist = boardlist;
    }

    /**
     * Add a board to the top of the list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    public addBoard(id: string, name: string, description: string, color: string = "") {
        const item = this.createBoard(id, name, description, color);
        this._boardlist.insertBefore(item, this._boardlist.firstElementChild); // Insert at top
    }

    /**
     * Add a board to the bottom of the list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    public addBoardToBottom(id: string, name: string, description: string, color: string = "") {
        const item = this.createBoard(id, name, description, color);
        this._boardlist.appendChild(item); // Insert at bottom
    }

    private createBoard(id: string, name: string, description: string, color: string = "") {
        const item = document.createElement("draggable-element");
        item["boardId"] = id;
        item.insertAdjacentHTML("beforeend",
            `<span class="dragger"></span><h2>${name}</h2><p>${description}</p>`);
        if (color != "") item.style.backgroundColor = color;

        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("taskInternalMove", e  =>
            this.onInternalMove(e.target, e["detail"]["toItem"]), false);

        return item;
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        window.location.href = "../Board/" + e.target.boardId;
    }

    onInternalMove(item, toItem) {
        var target: string;
        if (toItem) target = toItem.boardId;
        else        target = viewData.username;

        new ApiRequester().send("Boards", "ChangeOrder", "POST", [
            new RequestParameter("boardId", item.boardId),
            new RequestParameter("targetId", target)
        ]);
    }
}
