import { InputType } from "../enums/inputType";
import { IDialogTemplate } from "./IDialogTemplate";

/** setup board dialog schematic
 */
export const setupDialog: IDialogTemplate = {
    requestAction: "Boards",
    requestMethod: "Setup",
    requestType: "POST",
    title: "Setup Board",
    primaryButton: "Continue",
    inputs: []
}
