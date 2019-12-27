declare const viewData;

import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter";
import { IBoard } from "../models/IBoard";
import { DraggableItem } from "../components/draggableItem";

/**
 * Controller to add/remove/edit/etc. items in a board list.
 */

export class BoardListController {
    private boardlist: Element;

    constructor(boardlist: Element) {
        this.boardlist = boardlist;
    }

    /**
     * Add a board to the top of the list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    public addBoard(board: IBoard): void {
        const item = this.createBoard(board);
        this.boardlist.insertBefore(item, this.boardlist.firstElementChild); // Insert at top
    }

    /**
     * Add a board to the bottom of the list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    public addBoardToBottom(board: IBoard): void {
        const item = this.createBoard(board);
        this.boardlist.appendChild(item); // Insert at bottom
    }

    /**
     * Create a board item without placing it
     * @param id Board id
     * @param name Board name
     * @param description Board description
     * @param color Optional board color
     */
    private createBoard(board: IBoard): HTMLElement {
        const item = new DraggableItem();
        item.dataset.id = board.id;
        item.insertAdjacentHTML("beforeend",
            `<span class="dragger"></span><h2>${board.name}</h2><p>${board.description}</p>`);
        if (board.color != "") item.style.backgroundColor = board.color;

        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("taskInternalMove", e  =>
            this.onInternalMove(e.target as HTMLElement, e["detail"]["toItem"]), false);

        return item;
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    private onClickEvent(e: Event): void {
        const target = e.target as HTMLElement;
        window.location.href = "../Board/" + target.dataset.id;
    }

    /**
     * Fires when the board item was moved in the list.
     * @param item   {HTMLElement} Item being moved
     * @param toItem {HTMLElement} The item above it in the new location
     */
    private onInternalMove(item: HTMLElement, toItem: HTMLElement): void {
        var target: string;
        if (toItem) target = toItem.dataset.id;
        else        target = viewData.username; // If there is no item above, set the target to the user's username.

        new ApiRequester().send("Boards", "ChangeOrder", "POST", [
            new RequestParameter("boardId", item.dataset.id),
            new RequestParameter("targetId", target)
        ]);
    }
}
