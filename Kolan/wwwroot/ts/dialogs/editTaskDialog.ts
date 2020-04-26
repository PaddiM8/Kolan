import { DialogBox } from "../components/dialogBox";
import { property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardView } from "../views/boardView";
import { Task } from "../models/task";

declare const viewData;

@customElement("edit-task-dialog")
export class EditTaskDialog extends DialogBox {
    @property({type: String}) boardId;
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
            value: "Assign to",
            placeholder: "Username...",
            inputType: InputType.Text
        }
    ];
    @property({type: Object}) options = {
        title: "Edit Task",
        primaryButton: "Save"
    }

    constructor() {
        super();
    }

    async onOpen(): Promise<void> {
        const tagsElement = this.getInputElement("tags");

        // Populate data list with available users
        const userDataList = document.createElement("datalist");
        userDataList.id = "userDataList";

        const users = [ viewData.username, ...BoardView.collaborators ];
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

    async submitHandler(): Promise<void> {
        let task = this.getFormData();
        task["id"] = this.boardId;

        const response = await BoardView.boardHub.editTask(task as Task);
        if (response.statusCode != 200) {
            this.showErrors(response.value);
        } else {
            this.hide();
        }
    }
}
