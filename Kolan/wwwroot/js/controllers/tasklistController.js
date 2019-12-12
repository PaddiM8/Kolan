"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const draggableElement_1 = require("../components/draggableElement");
const requestParameter_1 = require("../communication/requestParameter");
const apiRequester_1 = require("../communication/apiRequester");
/**
 * Controller to add/remove/edit/etc. tasks in a tasklist.
 */
class TasklistController {
    constructor(tasklist) {
        this.tasklist = tasklist;
    }
    /**
     * Add a task to the tasklist.
     * @param   name        {string} Task title.
     * @param   description {string} Task description.
     * @param   color       {string} Task background color as HEX value.
     */
    addTask(id, name, description, color = "") {
        const item = this.createTaskItem(id, name, description, color);
        this.tasklist.insertBefore(item, this.tasklist.firstElementChild);
    }
    /**
     * Add a task to bottom of the tasklist.
     * @param   name        {string} Task title.
     * @param   description {string} Task description.
     * @param   color       {string} Task background color as HEX value.
     */
    addTaskToBottom(id, name, description, color = "") {
        const item = this.createTaskItem(id, name, description, color);
        this.tasklist.appendChild(item);
    }
    createTaskItem(id, name, description, color) {
        const item = new draggableElement_1.Draggable();
        item.dataset.id = id;
        item.insertAdjacentHTML("afterbegin", `
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
        if (color != "")
            item.style.backgroundColor = color;
        item.addEventListener("draggableClick", e => this.onClickEvent(e));
        item.addEventListener("mouseover", () => this.onHoverEvent(item));
        item.addEventListener("mouseleave", () => this.onMouseLeaveEvent(item));
        item.addEventListener("taskInternalMove", e => this.onInternalMove(e.target, e["detail"]["toItem"]));
        item.addEventListener("taskExternalMove", e => this.onExternalMove(e.target, e["detail"]["toItem"], e["detail"]["toTasklist"]));
        item.querySelector(".edit").addEventListener("click", () => this.onEditClick(item));
        item.querySelector(".save").addEventListener("click", () => this.onSaveClick(item));
        return item;
    }
    /**
     * Fires when the board item is clicked, ends if the clicked part was the dragger.
     */
    onClickEvent(e) {
        if (!this.inEditMode)
            console.log("clicked");
    }
    onInternalMove(item, toItem) {
        var target;
        if (toItem)
            target = toItem.dataset.id;
        else
            target = this.tasklist.dataset.id;
        this.sendMoveRequest(item.dataset.id, target);
    }
    onExternalMove(item, toItem, toTasklist) {
        var target;
        if (toItem)
            target = toItem.dataset.id;
        else
            target = toTasklist.dataset.id;
        this.sendMoveRequest(item.dataset.id, target);
    }
    sendMoveRequest(boardId, targetId) {
        new apiRequester_1.ApiRequester().send("Boards", viewData.id + "/ChangeOrder", "POST", [
            new requestParameter_1.RequestParameter("boardId", boardId),
            new requestParameter_1.RequestParameter("targetId", targetId),
        ]);
    }
    /**
     * Fires when the board item is hovered
     */
    onHoverEvent(item) {
        if (!this.inEditMode)
            item.querySelector(".overlay").style.display = "block";
    }
    /**
     * Fires when the mouse leaves the board item
     */
    onMouseLeaveEvent(item) {
        item.querySelector(".overlay").style.display = "";
    }
    onEditClick(item) {
        this.toggleEditMode(item);
    }
    onSaveClick(item) {
        this.toggleEditMode(item);
    }
    toggleEditMode(item) {
        // Hide/show original text
        const editLayer = item.querySelector(".edit-layer");
        const name = item.querySelector("h2");
        const text = item.querySelector("p");
        editLayer.style.display = this.inEditMode ? "none" : "block"; // Hide if in edit mode
        name.style.display = this.inEditMode ? "block" : "none"; // Show if in edit mode
        text.style.display = this.inEditMode ? "block" : "none";
        // Update text
        const nameEdit = editLayer.querySelector("input");
        const textEdit = editLayer.querySelector("textarea");
        const itemStyle = window.getComputedStyle(item, null);
        if (this.inEditMode) {
            name.innerHTML = nameEdit.value;
            text.innerHTML = textEdit.value;
        }
        else {
            nameEdit.value = name.innerHTML;
            textEdit.value = text.innerHTML;
        }
        this.onMouseLeaveEvent(item);
        item.movable = this.inEditMode;
        this.inEditMode = !this.inEditMode;
    }
}
exports.TasklistController = TasklistController;
