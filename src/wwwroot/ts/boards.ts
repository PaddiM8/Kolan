import "./components/draggableElement";
import { BoardListController } from "./controllers/boardListController";

window.addEventListener("load", () => new Boards().initiate());

class Boards {
   initiate() {
      document.getElementById("addBoard").addEventListener("click",
         this.onAddBoardClick);
   }

   onAddBoardClick() {
      const boardListController = new BoardListController(document
         .querySelector(".board-list tasklist"));
      boardListController.addBoard("Name", "Description", "#6163dd");
   };
}
