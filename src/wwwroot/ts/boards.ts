import "./components/components";
import { BoardListController } from "./controllers/boardListController";
import { addBoardDialog } from "./dialogs/addBoardDialog";
import { DialogBox } from "./components/dialogBox";

window.addEventListener("load", () => new Boards());

class Boards {
   /**
    * Add event listeners, dialogs that will be used, and more (on page load)
    */
   constructor() {
      // Prepare dialog
      let addDialog = new DialogBox(addBoardDialog, "addBoardDialog");
      document.body.appendChild(addDialog);
      addDialog.addEventListener("submitDialog", (e: CustomEvent) =>
         this.addBoardItem(e.detail.name, e.detail.description));

      // Events
      document.getElementById("addBoard").addEventListener("click", () =>
         addDialog.shown = true);
   }

   /** Adds a board item
    * @param   name        {string} Board name.
    * @param   description {string} Board description.
    */
   private addBoardItem(name, description) {
      const boardListController = new BoardListController(document
         .querySelector(".board-list tasklist"));
      boardListController.addBoard(name, description);
   }
}
