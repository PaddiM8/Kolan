import { InputType } from "../enums/inputType";

/** Defines dialog templates
 * The dialog title
 * The text of the submit button
 * Input elements
 */
export interface IDialogTemplate {
   title: string;
   primaryButton: string;
   inputs: IDialogInputs[];
}

/** Defines dialog inputs
 * Key used for objects with these values
 * Input element placeholder/label
 * InputType
 */
interface IDialogInputs {
   key: string;
   value: string;
   inputType: InputType;
}
