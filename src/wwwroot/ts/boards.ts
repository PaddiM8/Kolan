import "./components/draggableElement";
import "./components/dialogBox";
import { BoardListController } from "./controllers/boardListController";
import { addBoardDialog } from "./dialogs/addBoardDialog";

window.addEventListener("load", () => new Boards().initiate());

class Boards {
   initiate() {
      document.getElementById("addBoard").addEventListener("click",
         this.onAddBoardClick);
   }

   onAddBoardClick() {
      // Show dialog box
      const dialog: any = document.createElement("dialog-box");
      dialog.inputs = addBoardDialog;
      document.body.appendChild(dialog);

      // Add board item to list
      const boardListController = new BoardListController(document
         .querySelector(".board-list tasklist"));
      boardListController.addBoard("Name", "Description");
   };
}
