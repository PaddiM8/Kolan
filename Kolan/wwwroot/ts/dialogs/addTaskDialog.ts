import { InputType } from "../enums/inputType";
import { IDialogTemplate } from "./IDialogTemplate";

/** Dialog template for adding board items
 */
export const addTaskDialog: IDialogTemplate = {
    requestAction: "",
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
