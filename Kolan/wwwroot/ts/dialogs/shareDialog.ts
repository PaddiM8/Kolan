import { InputType } from "../enums/inputType";
import { IDialogTemplate } from "./IDialogTemplate";

/** Share dialog schematic
 */
export const shareDialog: IDialogTemplate = {
    requestAction: "",
    requestMethod: "",
    requestType: "",
    title: "Add collaborators",
    primaryButton: "Done",
    inputs: [
        {
            key: "inputList",
            value: "Users",
            inputType: InputType.InputList
        }
    ]
}
