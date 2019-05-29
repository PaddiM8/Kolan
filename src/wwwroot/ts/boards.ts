import "./components/draggableElement";
import "./components/dialogBox";
import { BoardListController } from "./controllers/boardListController";
import { addBoardDialog } from "./dialogs/addBoardDialog";

window.addEventListener("load", () => new Boards().initiate());

class Boards {
   private addDialog: any;

   initiate() {
      // Events
      document.getElementById("addBoard").addEventListener("click",
         this.onAddBoardClick);

      // Prepare dialog
      this.addDialog = document.createElement("dialog-box");
      dialog.id = "addBoardDialog";
      dialog.inputs = addBoardDialog;
      document.body.appendChild(dialog);
   }

   onAddBoardClick() {
      this.addDialog.shown = true;

      /* Add board item to list
      const boardListController = new BoardListController(document
         .querySelector(".board-list tasklist"));
      boardListController.addBoard("Name", "Description");*/
   };
}
