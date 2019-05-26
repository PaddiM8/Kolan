/**
 * Controller to add/remove/edit/etc. items in a board list.
 */

export class BoardListController {
   private _boardlist: Element;

   constructor(boardlist: Element) {
      this._boardlist = boardlist;
   }

   /**
    * Add a board to the board list.
    * @param   name        {string} Board name.
    * @param   description {string} Board description.
    * @param   color       {string} Board background color as HEX value.
    */
   public addBoard(name: string, description: string, color: string) {
      const item = document.createElement("draggable-element");
      item.insertAdjacentHTML("beforeend", `<h2>${name}</h2><p>${description}</p>`);
      item.style.backgroundColor = color;
      this._boardlist.appendChild(item);
   }
}
