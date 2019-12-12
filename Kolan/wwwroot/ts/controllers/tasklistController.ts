declare const viewData;

import { Draggable } from "../components/draggableElement";
import { RequestParameter } from "../communication/requestParameter";
import { ApiRequester } from "../communication/apiRequester";

/**
 * Controller to add/remove/edit/etc. tasks in a tasklist.
 */

export class TasklistController {
    private tasklist: HTMLElement;
    private inEditMode: boolean;

    constructor(tasklist: HTMLElement) {
        this.tasklist = tasklist;
    }

    /**
     * Add a task to the tasklist.
     * @param   name        {string} Task title.
     * @param   description {string} Task description.
     * @param   color       {string} Task background color as HEX value.
     */
    public addTask(id: string, name: string, description: string, color: string = "") {
        const item = this.createTaskItem(id, name, description, color);
        this.tasklist.insertBefore(item, this.tasklist.firstElementChild);
    }

    /**
     * Add a task to bottom of the tasklist.
     * @param   name        {string} Task title.
     * @param   description {string} Task description.
     * @param   color       {string} Task background color as HEX value.
     */
    public addTaskToBottom(id: string, name: string, description: string, color: string = "") {
        const item = this.createTaskItem(id, name, description, color);
        this.tasklist.appendChild(item);
    }

    /**
     * Create the HTML element of a task item.
     * @param id Board id
     * @param name Board name
     * @param description Board description
     * @param color Board color
     */
    public createTaskItem(id: string, name: string, description: string, color: string) {
        const item = new Draggable();
        item.dataset.id = id;
        item.insertAdjacentHTML("afterbegin",
            `
         <h2>${name}</h2><p>${description}</p>
         <div class="edit-layer">
            <input type="text" /><br />
            <textarea></textarea>
            <span class="save"></span>
         </div>
         <div class="overlay">
            <span class="edit overlay-button"></span>
            <span class="options overlay-button"></span>
         </div>
         `);

        if (color != "") item.style.backgroundColor = color;

        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("mouseover", () => this.onHoverEvent(item));
        item.addEventListener("mouseleave", () => this.onMouseLeaveEvent(item));

        item.addEventListener("taskInternalMove", e =>
            this.onInternalMove(e.target as HTMLElement, e["detail"]["toItem"]));

        item.addEventListener("taskExternalMove", e =>
            this.onExternalMove(e.target as HTMLElement, e["detail"]["toItem"], e["detail"]["toTasklist"]));

        item.querySelector(".edit").addEventListener("click", () =>
            this.onEditClick(item));

        item.querySelector(".save").addEventListener("click", () =>
            this.onSaveClick(item));

        return item;
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        if (!this.inEditMode)
            console.log("clicked");
    }

    onInternalMove(item: HTMLElement, toItem: HTMLElement) {
        var target: string;
        if (toItem) target = toItem.dataset.id;
        else        target = this.tasklist.dataset.id;

        this.sendMoveRequest(item.dataset.id, target);
    }

    onExternalMove(item: HTMLElement, toItem: HTMLElement, toTasklist: HTMLElement) {
        var target: string;
        if (toItem) target = toItem.dataset.id;
        else        target = toTasklist.dataset.id;

        this.sendMoveRequest(item.dataset.id, target);
    }

    sendMoveRequest(boardId: string, targetId: string) {
        new ApiRequester().send("Boards", viewData.id + "/ChangeOrder", "POST", [
            new RequestParameter("boardId", boardId),
            new RequestParameter("targetId", targetId),
        ])
    }

    /**
     * Fires when the board item is hovered
     */
    onHoverEvent(item: Draggable) {
        if (!this.inEditMode) {
            const overlay = item.querySelector(".overlay") as HTMLElement;
            overlay.style.display = "block";
        }
    }

    /**
     * Fires when the mouse leaves the board item
     */
    onMouseLeaveEvent(item: Draggable) {
        const overlay = item.querySelector(".overlay") as HTMLElement;
        overlay.style.display = "";
    }

    onEditClick(item: Draggable) {
        this.toggleEditMode(item)
    }

    onSaveClick(item: Draggable) {
        this.toggleEditMode(item)
    }

    /**
     * Toggle the edit mode on a specific task item. 
     * If it isn't already in edit mode it will change to it
     * and let the user change the contents of the task.
     * @param item Task item to do it on
     */
    toggleEditMode(item: Draggable) {
        // Hide/show original text
        const editLayer = item.querySelector(".edit-layer") as HTMLElement;
        const name      = item.querySelector("h2") as HTMLElement;
        const text      = item.querySelector("p") as HTMLElement;
        editLayer.style.display = this.inEditMode ? "none"  : "block"; // Hide if in edit mode
        name.style.display      = this.inEditMode ? "block" : "none"; // Show if in edit mode
        text.style.display      = this.inEditMode ? "block" : "none";

        // Update text
        const nameEdit  = editLayer.querySelector("input");
        const textEdit  = editLayer.querySelector("textarea");
        const itemStyle = window.getComputedStyle(item, null);
        if (this.inEditMode) {
            name.innerHTML  = nameEdit.value;
            text.innerHTML  = textEdit.value;
        } else {
            nameEdit.value  = name.innerHTML;
            textEdit.value  = text.innerHTML;
        }


        this.onMouseLeaveEvent(item);
        item.movable = this.inEditMode;
        this.inEditMode = !this.inEditMode;
    }
}
