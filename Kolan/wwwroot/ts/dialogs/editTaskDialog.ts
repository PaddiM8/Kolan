import { InputType } from "../enums/inputType";
import { IDialogTemplate } from "./IDialogTemplate";

/** add task dialog schematic
 */
export const editTaskDialog: IDialogTemplate = {
    requestAction: "Boards",
    requestMethod: "",
    requestType: "PUT",
    title: "Edit Task",
    primaryButton: "Edit",
    inputs: [
        {
            key: "name",
            value: "Task title",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Task description",
            inputType: InputType.TextArea
        }
    ]
}
