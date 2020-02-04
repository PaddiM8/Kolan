import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";

@customElement("add-task-dialog")
export class AddTaskDialog extends DialogBox {
    @property({type: String}) groupId;
    @property({type: Array<object>()}) fields = [
        {
            key: "name",
            value: "Task title",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Task description",
            inputType: InputType.TextArea
        },
        {
            key: "tags",
            value: "Tags (separated by comma)",
            inputType: InputType.Text
        },
        {
            key: "color",
            value: "Color (HEX value)",
            inputType: InputType.Text
        }
    ];
    @property({type: Object}) options = {
        title: "Add Task",
        primaryButton: "Add"
    }

    submitHandler(): void {
        const task = this.getFormData();
        new BoardHub().addTask(task, this.groupId);
        this.hide();
    }
}
