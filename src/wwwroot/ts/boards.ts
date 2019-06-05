/*import "./components/draggableElement";
import "./components/dialogBox";*/
import "./components/components";
import { BoardListController } from "./controllers/boardListController";
import { addBoardDialog } from "./dialogs/addBoardDialog";
import { DialogBox } from "./components/dialogBox";

window.addEventListener("load", () => new Boards().initiate());

class Boards {
   /**
    * Add event listeners, dialogs that will be used, and more (on page load)
    */
   initiate() {
      // Events
      document.getElementById("addBoard").addEventListener("click",
         this.onAddBoardClick);

      // Prepare dialog
      let addDialog = new DialogBox(addBoardDialog, "addBoardDialog");
      document.body.appendChild(addDialog);
      addDialog.addEventListener("submitDialog", (e: CustomEvent) =>
         this.addBoardItem(e.detail.name, e.detail.description));
   }

   /**
    * Runs when the 'add board' button is clicked, shows the dialog
    */
   onAddBoardClick() {
      const addBoardDialog: any = document.getElementById("addBoardDialog");
      addBoardDialog.shown = true;
   };

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
