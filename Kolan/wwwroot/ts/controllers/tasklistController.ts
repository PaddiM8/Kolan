import { Draggable } from "../components/draggableElement";

/**
 * Controller to add/remove/edit/etc. tasks in a tasklist.
 */

export class TasklistController {
    private _tasklist: Element;
    private _inEditMode: boolean;

    constructor(tasklist: Element) {
        this._tasklist = tasklist;
    }

    /**
     * Add a task to the tasklist.
     * @param   title       {string} Task title.
     * @param   description {string} Task description.
     * @param   color       {string} Task background color as HEX value.
     */
    public addTask(title: string, description: string, color: string = "") {
        const item = new Draggable();
        item.insertAdjacentHTML("beforeend",
            `
         <h2>${title}</h2><p>${description}</p>
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
        this._tasklist.appendChild(item);

        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("mouseover", () => this.onHoverEvent(item));
        item.addEventListener("mouseleave", () => this.onMouseLeaveEvent(item));
        item.querySelector(".edit").addEventListener("click", () =>
            this.onEditClick(item));
        item.querySelector(".save").addEventListener("click", () =>
            this.onSaveClick(item));
    }

    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        if (!this._inEditMode)
            console.log("clicked");
    }

    /**
     * Fires when the board item is hovered
     */
    onHoverEvent(item) {
        if (!this._inEditMode)
            item.querySelector(".overlay").style.display = "block";
    }

    /**
     * Fires when the mouse leaves the board item
     */
    onMouseLeaveEvent(item) {
        item.querySelector(".overlay").style.display = "";
    }

    onEditClick(item) {
        this.toggleEditMode(item)
    }

    onSaveClick(item) {
        this.toggleEditMode(item)
    }

    toggleEditMode(item) {
        // Hide/show original text
        const editLayer = item.querySelector(".edit-layer");
        const title     = item.querySelector("h2")
        const text      = item.querySelector("p")
        editLayer.style.display = this._inEditMode ? "none"  : "block"; // Hide if in edit mode
        title.style.display     = this._inEditMode ? "block" : "none"; // Show if in edit mode
        text.style.display      = this._inEditMode ? "block" : "none";

        // Update text
        const titleEdit = editLayer.querySelector("input");
        const textEdit  = editLayer.querySelector("textarea");
        const itemStyle = window.getComputedStyle(item, null);
        if (this._inEditMode) {
            title.innerHTML = titleEdit.value;
            text.innerHTML  = textEdit.value;
        } else {
            titleEdit.value = title.innerHTML;
            textEdit.value  = text.innerHTML;
        }


        this.onMouseLeaveEvent(item);
        item.movable = this._inEditMode;
        this._inEditMode = !this._inEditMode;
    }
}
