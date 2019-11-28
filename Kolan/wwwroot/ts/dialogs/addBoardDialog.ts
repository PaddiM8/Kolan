import { InputType } from "../enums/inputType";
import { IDialogTemplate } from "./IDialogTemplate";

/** add board dialog schematic
 */
export const addBoardDialog: IDialogTemplate = {
    requestAction: "Boards",
    requestMethod: "",
    requestType: "POST",
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
