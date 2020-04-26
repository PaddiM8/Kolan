import { DialogType } from "../enums/dialogType";
import { InputType } from "../enums/inputType";

export interface DialogOptions {
    dialogType?: DialogType;
    title: string;
    primaryButton: string;
    redSubmitButton?: boolean;

}

export interface DialogField {
    inputType: InputType,
    key: string;
    value?: string;
    title?: string;
    placeholder?: string;
    optional?: boolean;
    red?: boolean;
}