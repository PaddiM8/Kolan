import { InputType } from "../enums/inputType";
import { IDialogTemplate } from "./IDialogTemplate";

/** add task dialog schematic
 */
export const addTaskDialog: IDialogTemplate = {
    requestAction: "Boards",
    requestMethod: "",
    requestType: "POST",
    title: "Add Task",
    primaryButton: "Add",
    inputs: [
        {
            key: "title",
            value: "Task title",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Task description",
            inputType: InputType.Text
        }
    ]
}
