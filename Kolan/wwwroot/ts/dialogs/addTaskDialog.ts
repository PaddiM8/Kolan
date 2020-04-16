import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { ITask } from "../models/ITask";
import { Board } from "../views/board";
import { IHub } from "../communication/IHub";
import { ContentFormatter } from "../processing/contentFormatter";

declare const viewData;

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
            placeholder: "some, example, tags",
            inputType: InputType.Text
        },
        {
            key: "deadline",
            value: "Deadline",
            inputType: InputType.Date,
            optional: true
        },
        {
            key: "assignee",
            value: "Assigned to",
            placeholder: "Username...",
            inputType: InputType.Text
        },
        {
            key: "onTop",
            value: "Put on top",
            inputType: InputType.Checkbox
        }
    ];
    @property({type: Object}) options = {
        title: "Add Task",
        primaryButton: "Add"
    };

    constructor() {
        super();
    }

    onOpen() {
        const tagsElement = this.getInputElement("tags");

        // Populate data list with available users
        const userDataList = document.createElement("datalist");
        userDataList.id = "userDataList";

        const users = [ viewData.username, ...Board.collaborators ];
        for (const collaborator of users) {
            const option = document.createElement("option");
            option.value = collaborator;
            userDataList.appendChild(option);
        }

        // Set the assignee input's list to the new data list
        const assigneeElement = this.getInputElement("assignee");
        assigneeElement.parentNode.appendChild(userDataList);
        assigneeElement.setAttribute("list", "userDataList");
    }

    submitHandler(): void {
        let data = this.getFormData();
        const onTop: boolean = data["onTop"];
        delete data["onTop"];

        Board.boardHub.addTask(data as ITask, this.groupId).then(x => {
            if (x.statusCode != 200) {
                this.showErrors(x.value);
                return;
            }

            // Move the task to the top of the group if that option is checked.
            if (onTop) {
                Board.boardHub.moveTask(x.value["id"], this.groupId);
            }

            this.hide();
        });
    }
}
