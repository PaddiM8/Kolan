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
     * Add a board to the board list.
     * @param   name        {string} Board name.
     * @param   description {string} Board description.
     * @param   color       {string} Board background color as HEX value.
     */
    public addBoard(id: string, name: string, description: string, color: string = "") {
        const item = document.createElement("draggable-element");
        item["boardId"] = id;
        item.insertAdjacentHTML("beforeend",
            `<span class="dragger"></span><h2>${name}</h2><p>${description}</p>`);
        if (color != "") item.style.backgroundColor = color;
        this._boardlist.appendChild(item);

        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("taskInternalMove", e  =>
            this.onInternalMove(e["detail"]["fromIndex"], e["detail"]["toIndex"]), false);
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        window.location.href = "../Board/" + e.srcElement.boardId;
    }

    onInternalMove(fromIndex, toIndex) {
        new ApiRequester().send("Boards", "ChangeOrder", "POST", [
            new RequestParameter("fromIndex", fromIndex),
            new RequestParameter("toIndex", toIndex)
        ]);
    }
}
