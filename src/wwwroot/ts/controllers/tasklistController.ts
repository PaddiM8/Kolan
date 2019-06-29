import { Draggable } from "../components/draggableElement";

/**
 * Controller to add/remove/edit/etc. tasks in a tasklist.
 */

export class TasklistController {
   private _tasklist: Element;

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
   }

   /**
    * Fires when the board item is clicked, ends if the clicked part was the dragger.
    */
   onClickEvent(e) {
      console.log("clicked");
   }

   /**
    * Fires when the board item is hovered
    */
   onHoverEvent(item) {
      item.querySelector(".overlay").style.display = "block";
   }

   /**
    * Fires when the mouse leaves the board item
    */
   onMouseLeaveEvent(item) {
      item.querySelector(".overlay").style.display = "";
   }
}
