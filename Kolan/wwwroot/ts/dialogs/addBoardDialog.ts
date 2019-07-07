import { InputType } from "../enums/inputType";
import { IDialogTemplate } from "./IDialogTemplate";

/** Dialog template for adding board items
 */
export const addBoardDialog: IDialogTemplate = {
   title: "Add Board",
   primaryButton: "Add",
   inputs: [
      {
         key: "name",
         value: "Board name",
         inputType: InputType.Text
      },
      {
         key: "description",
         value: "Short description",
         inputType: InputType.Text
      }
   ]
}
