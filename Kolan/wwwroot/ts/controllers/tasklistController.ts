const seedrandom = require("seedrandom");
import { DraggableItem } from "../components/draggableItem";
import { RequestParameter } from "../communication/requestParameter";
import { ApiRequester } from "../communication/apiRequester";
import { ITask } from "../models/ITask";
import { IBoard } from "../models/IBoard";
import { Board } from "../views/board";
import { ContentFormatter } from "../processing/contentFormatter";
import { BoardHub } from "../communication/boardHub";
import { ConfirmDialog } from "../dialogs/confirmDialog";
import { PermissionLevel } from "../enums/permissionLevel";

/**
 * Controller to add/remove/edit/etc. tasks in a tasklist.
 */

export class TasklistController {
    public tasklist: HTMLElement;
    public name: string;
    private inEditMode: boolean;
    private boardHub: BoardHub;
    private backgroundLuminance: number;
    private taskColorSeed: string;

    constructor(tasklist: HTMLElement, name: string, boardHub: BoardHub, taskColorSeed: string) {
        this.tasklist = tasklist;
        this.name = name;
        this.backgroundLuminance = this.getLuminance(window.getComputedStyle(document.body, null)
                                                   .getPropertyValue("background-color"));
        this.taskColorSeed = taskColorSeed;
    }

    /**
     * Add a task to bottom of the tasklist.
     * @param   task        {ITask} Task.
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

    public editTask(newTaskContent: ITask): void {
        const item = document.querySelector(`#tasklists [data-id="${newTaskContent.id}"]`) as HTMLElement;
        const name = item.querySelector(".name") as HTMLElement;
        const description = item.querySelector(".description") as HTMLElement;
        const assignee = item.querySelector(".assignee") as HTMLElement;

        item.dataset.description = newTaskContent.description ? newTaskContent.description : "";
        name.textContent = ContentFormatter.format(newTaskContent.name);
        description.innerHTML = ContentFormatter.formatWithMarkdown(newTaskContent.description);
        if (newTaskContent.tags) item.style.backgroundColor = this.generateColor(this.firstTag(newTaskContent.tags))
        assignee.textContent = newTaskContent.assignee;
    }

    /**
     * Create the HTML element of a task item.
     * @param task ITask task
     */
    public createTaskItem(task: ITask): HTMLElement {
        const item = new DraggableItem();
        item.movable = Board.permissionLevel == PermissionLevel.Edit;
        item.dataset.id = task.id;
        item.dataset.description = task.description ? task.description : "";
        task.name = ContentFormatter.format(task.name);
        task.description = ContentFormatter.formatWithMarkdown(task.description);
        task.assignee = ContentFormatter.format(task.assignee);

        item.insertAdjacentHTML("afterbegin", `
         <h2 class="name"></h2>
         <span class="description">${task.description}</span>
         <div class="overlay">
            <span class="icon icon-pen top-right edit overlay-button"
                  role="button">
                  </span>
            <span class="icon icon-trash bottom-right delete overlay-button"
                  role="button">
                  </span>
         </div>
         <span class="assignee">${task.assignee}</span>
         `);

        item.querySelector(".name").textContent = task.name;
        item.dataset.tags = task.tags;

        if (task.tags) item.style.backgroundColor = this.generateColor(this.firstTag(task.tags));

        item.addEventListener("draggableClick", e => this.onClickEvent(e));

        if (Board.permissionLevel == PermissionLevel.Edit) {
            item.addEventListener("mouseover", () => this.onHoverEvent(item));
            item.addEventListener("mouseleave", () => this.onMouseLeaveEvent(item));
        }

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
        if (!e.detail["childClicked"]) { // Only redirect if the background was clicked
            const id = e.target.dataset.id;
            window.location.href = "./" + id;
        }
    }

    private onInternalMove(item: HTMLElement, toItem: HTMLElement): void {
        if (toItem == item.nextSibling) return; // If it was just dropped at the same place

        this.onExternalMove(item, toItem, this.tasklist);
    }

    private onExternalMove(item: HTMLElement, toItem: HTMLElement, toTasklist: HTMLElement): void {
        var target: string;
        if (toItem) target = toItem.dataset.id;
        else        target = toTasklist.dataset.id;

        this.sendMoveRequest(item.dataset.id, target);
    }

    private sendMoveRequest(boardId: string, targetId: string): void {
       this.boardHub.moveTask(boardId, targetId);
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
            description: item.dataset.description,
            tags: item.dataset.tags,
            assignee: item.querySelector(".assignee").innerHTML
        });
    }

    private onDeleteClick(item: DraggableItem) {
        const confirmDialog = new ConfirmDialog("Delete task?", "Delete");
        document.body.appendChild(confirmDialog);
        confirmDialog.shown = true;
        confirmDialog.addEventListener("submitDialog", () => {
            this.boardHub.deleteTask(item.dataset.id);
            item.parentNode.removeChild(item);
            document.body.removeChild(confirmDialog);
        });
    }

    private firstTag(input: string): string {
        const commaIndex = input.indexOf(",");

        if (commaIndex == -1) {
            return input;
        } else {
            console.log(input.substring(0, commaIndex));
            return input.substring(0, commaIndex);
        }
    }

    private generateColor(input: string): string {
        const rnd = seedrandom.alea(input + this.taskColorSeed);
        const h = Math.floor(rnd() * Math.floor(360));
        const s = this.backgroundLuminance > 125 ? "62%" : "72%";
        const l = this.backgroundLuminance > 125 ? "50%" : "42%";

        return `hsl(${h}, ${s}, ${l})`;
    }

    private getLuminance(rgbString: string) {
        const rgb: string[] = rgbString.substring(4, rgbString.length - 2).split(", ");

        return 0.2126 * parseInt(rgb[0]) + 0.7152 * parseInt(rgb[1]) + 0.0722 * parseInt(rgb[2]);
    }
}
