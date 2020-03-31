import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { Board } from "../views/board";

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
            key: "assignee",
            value: "Assign to",
            placeholder: "Username...",
            inputType: InputType.Text
        }
    ];
    @property({type: Object}) options = {
        title: "Edit Task",
        primaryButton: "Edit"
    }

    private boardHub: BoardHub;

    constructor(boardHub: BoardHub) {
        super();

        this.boardHub = boardHub;
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
        let task = this.getFormData();
        task["id"] = this.boardId;

        this.boardHub.editTask(task).then(x => {
            if (x.statusCode != 200) {
                this.showErrors(x.value);
            } else {
                this.hide();
            }
        });
    }
}
