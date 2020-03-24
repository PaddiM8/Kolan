import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { Board } from "../views/board";
import { IModelError } from "../models/IModelError";

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
        },
        {
            key: "color",
            value: "Color",
            placeholder: "#d3d3d3",
            inputType: InputType.Color
        }
    ];
    @property({type: Object}) options = {
        title: "Edit Task",
        primaryButton: "Edit"
    }

    onOpen() {
        const tagsElement = this.getInputElement("tags");
        const colorElement = this.getInputElement("color");
        tagsElement.addEventListener("blur", () => {
            const tags = tagsElement.value;
            const tagColor = localStorage.getItem("tag_" + this.getFirstTag(tags));

            if (tagColor) colorElement.value = tagColor;
        });

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

        new BoardHub().editTask(task).then(x => {
            if (x.statusCode < 200 || x.statusCode > 200) {
                this.showErrors(x.value as IModelError[]);
            } else {
                this.hide();
            }
        });
    }

    private getFirstTag(tags: string): string {
        const firstComma = tags.indexOf(",");

        return firstComma > 0 ? tags.substring(0, firstComma) : tags;
    }
}
