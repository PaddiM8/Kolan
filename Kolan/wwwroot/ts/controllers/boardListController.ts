declare const viewData;

import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter";

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

    /**
     * Create a board item without placing it
     * @param id Board id
     * @param name Board name
     * @param description Board description
     * @param color Optional board color
     */
    private createBoard(id: string, name: string, description: string, color: string = "") {
        const item = document.createElement("draggable-element");
        item.dataset.id = id;
        item.insertAdjacentHTML("beforeend",
            `<span class="dragger"></span><h2>${name}</h2><p>${description}</p>`);
        if (color != "") item.style.backgroundColor = color;

        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("taskInternalMove", e  =>
            this.onInternalMove(e.target as HTMLElement, e["detail"]["toItem"]), false);

        return item;
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e: Event) {
        const target = e.target as HTMLElement;
        window.location.href = "../Board/" + target.dataset.id;
    }

    /**
     * Fires when the board item was moved in the list.
     * @param item   {HTMLElement} Item being moved
     * @param toItem {HTMLElement} The item above it in the new location
     */
    onInternalMove(item: HTMLElement, toItem: HTMLElement) {
        var target: string;
        if (toItem) target = toItem.dataset.id;
        else        target = viewData.username; // If there is no item above, set the target to the user's username.

        new ApiRequester().send("Boards", "ChangeOrder", "POST", [
            new RequestParameter("boardId", item.dataset.id),
            new RequestParameter("targetId", target)
        ]);
    }
}
