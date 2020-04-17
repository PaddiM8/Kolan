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
    private backgroundLuminance: number;
    private taskColorSeed: string;

    constructor(tasklist: HTMLElement, name: string, taskColorSeed: string) {
        this.tasklist = tasklist;
        this.name = name;
        this.taskColorSeed = taskColorSeed;

        this.backgroundLuminance = this.getLuminance(window.getComputedStyle(document.body, null)
                                                   .getPropertyValue("background-color"));
    }

    /**
     * Add a task to bottom of the tasklist.
     */
    public addTask(task: ITask): void {
        const item = this.createTaskItem(task);
        this.tasklist.appendChild(item);
    }

    /**
    * Automatically move a task to under another task.
    */
    public moveTask(boardId: string, targetId: string): void {
        const item = document.querySelector(`#tasklists [data-id="${boardId}"]`);
        const target = document.querySelector(`#tasklists [data-id="${targetId}"]`);
        item.parentNode.removeChild(item);

        // If the target is a board
        if (target.tagName == "DRAGGABLE-ITEM") {
            target.parentNode.insertBefore(item, target.nextSibling); // Insert the board under the target inside its parent
        } else {
            if (target.children.length > 0) target.insertBefore(item, target.firstChild);
            else target.appendChild(item);
        }
    }

    /**
    * Edit the contents of a task. This actually just removes the task and adds it again, with the new content
    */
    public editTask(newTaskContent: ITask): void {
       const item = document.querySelector(`#tasklists [data-id="${newTaskContent.id}"]`) as HTMLElement;
       item.parentElement.insertBefore(this.createTaskItem(newTaskContent), item.nextElementSibling);
       item.remove();

    }

    /**
     * Create the HTML element of a task item.
     */
    public createTaskItem(task: ITask): HTMLElement {
        const item = new DraggableItem();
        item.movable = Board.permissionLevel >= PermissionLevel.Edit;
        item.dataset.id = task.id;
        item.dataset.description = task.description ? task.description : "";
        item.dataset.deadline = task.deadline.toString();
        task.description = ContentFormatter.markdown(task.description);

        item.insertAdjacentHTML("afterbegin", `
        <span class="icon icon-clock top-left overdue-icon overlay-button"
              role="button">
              </span>

         <div class="content dragger">
            <h2 class="name"></h2>
            <span class="description">${task.description}</span>
         </div>
         <div class="overlay">
            <span class="icon icon-pen top-right edit overlay-button"
                  role="button">
                  </span>
            <span class="icon icon-trash bottom-right delete overlay-button"
                  role="button">
                  </span>
            <span class="deadline">${task.deadline == 0 ? "" : ContentFormatter.date(task.deadline)}</span>
         </div>

         <span class="assignee">${task.assignee}</span>
         `);

        item.querySelector(".name").textContent = task.name;
        item.dataset.tags = task.tags;
        if (task.tags) item.style.backgroundColor = this.generateColor(this.firstTag(task.tags));

        // If overdue deadline
        if (task.deadline != 0 && task.deadline - Date.now() < 0) {
            item.classList.add("overdue");
        }

        // Events
        item.addEventListener("draggableClick", e => this.onClickEvent(e));

        if (Board.permissionLevel >= PermissionLevel.Edit) {
            item.addEventListener("mouseover", () => this.onHoverEvent(item));
            item.addEventListener("mouseleave", () => this.onMouseLeaveEvent(item));
        }

        item.addEventListener("taskInternalMove", e =>
            this.onInternalMove(e.target as HTMLElement, e["detail"]["toItem"]));

        item.addEventListener("taskExternalMove", e =>
            this.onExternalMove(e.target as HTMLElement, e["detail"]["toItem"], e["detail"]["toTasklist"]));

        // Add event listeners to overlay buttons if the user has permission to use them, otherwise remove them
        if (Board.permissionLevel >= PermissionLevel.Edit) {
            item.querySelector(".edit").addEventListener("click", () =>
                this.onEditClick(item));

            item.querySelector(".delete").addEventListener("click", () =>
                this.onDeleteClick(item));
        } else {
            const overlayButtons = item.querySelectorAll(".overlay-button");
            for (const overlayButton of overlayButtons)
                overlayButton.remove();
        }


        return item;
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    private onClickEvent(e): void {
        if (e.detail["target"].classList.contains("content")) { // Only redirect if the background was clicked
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
       Board.boardHub.moveTask(boardId, targetId);
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
            deadline: parseInt(item.dataset.deadline),
            assignee: item.querySelector(".assignee").innerHTML
        });
    }

    private onDeleteClick(item: DraggableItem) {
        const confirmDialog = new ConfirmDialog("Delete task?", "Delete");
        document.body.appendChild(confirmDialog);
        confirmDialog.shown = true;
        confirmDialog.addEventListener("submitDialog", () => {
            Board.boardHub.deleteTask(item.dataset.id);
            item.parentNode.removeChild(item);
            document.body.removeChild(confirmDialog);
        });
    }

    /**
    * Extract the first tag out of a string of tags divided by comma.
    */
    private firstTag(input: string): string {
        const commaIndex = input.indexOf(",");

        if (commaIndex == -1) {
            return input;
        } else {
            console.log(input.substring(0, commaIndex));
            return input.substring(0, commaIndex);
        }
    }

    /**
    * Generate a colour using a string, this colour will be the same if the same string if provided the next time.
    */
    private generateColor(input: string): string {
        const rnd = seedrandom.alea(input + this.taskColorSeed);
        const h = Math.floor(rnd() * 360);
        const s = this.backgroundLuminance > 125 ? "62%" : "72%";
        const l = this.backgroundLuminance > 125 ? "50%" : "42%";

        return `hsl(${h}, ${s}, ${l})`;
    }

    /**
    * Get the luminance of an rgb(x, x, x) colour.
    */
    private getLuminance(rgbString: string) {
        const rgb: string[] = rgbString.substring(4, rgbString.length - 2).split(", ");

        return 0.2126 * parseInt(rgb[0]) + 0.7152 * parseInt(rgb[1]) + 0.0722 * parseInt(rgb[2]);
    }
}
