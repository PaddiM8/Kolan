import { ApiRequester } from "../communication/apiRequester";
import { Task } from "../models/task";
import { RequestType } from "../enums/requestType";
import { DraggableItem } from "../components/draggableItem";

declare const viewData;

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
     */
    public addBoard(board: Task): void {
        const item = this.createBoard(board);
        this.boardlist.insertBefore(item, this.boardlist.firstElementChild); // Insert at top
    }

    /**
     * Add a board to the bottom of the list.
     */
    public addBoardToBottom(board: Task): void {
        const item = this.createBoard(board);
        this.boardlist.appendChild(item); // Insert at bottom
    }

    /**
     * Create a board item without placing it
     */
    private createBoard(board: Task): HTMLElement {
        const item = new DraggableItem();
        item.dataset.id = board.id;
        board.description = board.description ? board.description : "";

        item.insertAdjacentHTML("beforeend", `<div class="side"><span class="dragger icon icon-hamburger"></span></div><h2></h2><p></p>`);
        item.querySelector("h2").textContent = board.name;
        item.querySelector("p").textContent = board.description;

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
     */
    private onInternalMove(item: HTMLElement, toItem: HTMLElement): void {
        var target: string;
        if (toItem) target = toItem.dataset.id;
        else        target = viewData.username; // If there is no item above, set the target to the user's username.

        ApiRequester.boards.move(item.dataset.id, target);
    }
}
