import { DraggableItem } from "../components/draggableItem";
import { RequestParameter } from "../communication/requestParameter";
import { ApiRequester } from "../communication/apiRequester";
import { ITask } from "../models/ITask";
import { IBoard } from "../models/IBoard";
import { Board } from "../views/board";
import { ContentFormatter } from "../processing/contentFormatter";
import { BoardHub } from "../communication/boardHub";
import { ConfirmDialog } from "../dialogs/confirmDialog";

/**
 * Controller to add/remove/edit/etc. tasks in a tasklist.
 */

export class TasklistController {
    public tasklist: HTMLElement;
    public name: string;
    private inEditMode: boolean;

    constructor(tasklist: HTMLElement, name: string) {
        this.tasklist = tasklist;
        this.name = name;
    }

    /**
     * Add a task to bottom of the tasklist.
     * @param   name        {string} Task title.
     * @param   description {string} Task description.
     * @param   color       {string} Task background color as HEX value.
     */
    public addTask(task: ITask): void {
        const item = this.createTaskItem(task);
        this.tasklist.appendChild(item);
    }

    public moveTask(boardId: string, targetId: string): void {
        const item = document.querySelector(`#tasklists [data-id="${boardId}"]`);
        const target = document.querySelector(`#tasklists [data-id="${targetId}"]`);
        item.parentNode.removeChild(item);

        // If the target is a board
        if (target.tagName == "DRAGGABLE-ITEM") {
            target.parentNode.insertBefore(item, target.nextSibling); // Insert the board under the target inside its parent
        } else {
            // If a board with the targetId does not exist, assume it's for a tasklist and place it at the top of that.
            if (this.tasklist.childElementCount > 0) this.tasklist.insertBefore(item, this.tasklist.firstChild);
            else this.tasklist.appendChild(item);
        }
    }

    public editTask(newBoardContent: IBoard): void {
        const item = document.querySelector(`#tasklists [data-id="${newBoardContent.id}"]`) as HTMLElement;
        const name = item.querySelector(".name") as HTMLElement;
        const description = item.querySelector(".description") as HTMLElement;

        item.dataset.description = newBoardContent.description ? newBoardContent.description : "";
        name.textContent = ContentFormatter.format(newBoardContent.name);
        description.innerHTML = ContentFormatter.formatWithMarkdown(newBoardContent.description);
    }

    /**
     * Create the HTML element of a task item.
     * @param id Board id
     * @param name Board name
     * @param description Board description
     * @param color Board color
     */
    public createTaskItem(task: ITask): HTMLElement {
        const item = new DraggableItem();
        item.dataset.id = task.id;
        item.dataset.description = task.description ? task.description : "";
        task.name = ContentFormatter.format(task.name);
        task.description = ContentFormatter.formatWithMarkdown(task.description);

        item.insertAdjacentHTML("afterbegin",
            `
         <h2 class="name"></h2>
         <br />
         <span class="description">${task.description}</span>
         <div class="overlay">
            <fa-icon class="fas fa-pen top-right edit overlay-button"
                     size="21px"
                     role="button"
                     color="#fff"
                     path-prefix="/node_modules">
                     </fa-icon>
            <fa-icon class="fas fa-trash bottom-right delete overlay-button"
                     size="21px"
                     role="button"
                     color="#fff"
                     path-prefix="/node_modules">
                     </fa-icon>
         </div>
         `);

         item.querySelector(".name").textContent = task.name;

        if (task.color != "") item.style.backgroundColor = task.color;

        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("mouseover", () => this.onHoverEvent(item));
        item.addEventListener("mouseleave", () => this.onMouseLeaveEvent(item));

        item.addEventListener("taskInternalMove", e =>
            this.onInternalMove(e.target as HTMLElement, e["detail"]["toItem"]));

        item.addEventListener("taskExternalMove", e =>
            this.onExternalMove(e.target as HTMLElement, e["detail"]["toItem"], e["detail"]["toTasklist"]));

        item.querySelector(".edit").addEventListener("click", () =>
            this.onEditClick(item));

        item.querySelector(".delete").addEventListener("click", () =>
            this.onDeleteClick(item));

        return item;
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    private onClickEvent(e): void {
        if (!this.inEditMode) {
            const id = e.target.dataset.id;
            window.location.href = "./" + id;
        }
    }

    private onInternalMove(item: HTMLElement, toItem: HTMLElement): void {
        this.onExternalMove(item, toItem, this.tasklist);
    }

    private onExternalMove(item: HTMLElement, toItem: HTMLElement, toTasklist: HTMLElement): void {
        var target: string;
        if (toItem) target = toItem.dataset.id;
        else        target = toTasklist.dataset.id;

        this.sendMoveRequest(item.dataset.id, target);
    }

    private sendMoveRequest(boardId: string, targetId: string): void {
        /*new ApiRequester().send("Boards", Board.viewData.id + "/ChangeOrder", "POST", [
            new RequestParameter("boardId", boardId),
            new RequestParameter("targetId", targetId),
        ]);*/

       new BoardHub().moveTask(boardId, targetId);
    }

    /**
     * Fires when the board item is hovered
     */
    private onHoverEvent(item: DraggableItem): void {
        if (!this.inEditMode) {
            const overlay = item.querySelector(".overlay") as HTMLElement;
            overlay.style.display = "block";
        }
    }

    /**
     * Fires when the mouse leaves the board item
     */
    private onMouseLeaveEvent(item: DraggableItem): void {
        const overlay = item.querySelector(".overlay") as HTMLElement;
        overlay.style.display = "";
    }

    private onEditClick(item: DraggableItem): void {
        Board.dialogs.editTask.shown = true;
        Board.dialogs.editTask.boardId = item.dataset.id;
        Board.dialogs.editTask.setValues({
            name: item.querySelector(".name").innerHTML,
            description: item.dataset.description
        });
    }

    private onDeleteClick(item: DraggableItem) {
        const confirmDialog = new ConfirmDialog("Delete task?", "Delete");
        document.body.appendChild(confirmDialog);
        confirmDialog.shown = true;
        confirmDialog.addEventListener("submitDialog", () => {
            new BoardHub().deleteTask(item.dataset.id);
            item.parentNode.removeChild(item);
            document.body.removeChild(confirmDialog);
        });
    }
}
