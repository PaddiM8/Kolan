import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { ITask } from "../models/ITask";
import { Board } from "../views/board";

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
            key: "color",
            value: "Color",
            placeholder: "#d3d3d3",
            inputType: InputType.Color
        },
        {
            key: "assignee",
            value: "Assigned to",
            placeholder: "Username...",
            inputType: InputType.Text
        }
    ];
    @property({type: Object}) options = {
        title: "Add Task",
        primaryButton: "Add"
    }

    onOpen() {
        const tagsElement = this.getInputElement("tags");
        tagsElement.addEventListener("blur", () => {
            const tags = tagsElement.value;
            const tagColor = localStorage.getItem("tag_" + this.getFirstTag(tags));
            const colorElement = this.getInputElement("color");

            colorElement.value = tagColor;
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
        const task = this.getFormData() as ITask;
        new BoardHub().addTask(task, this.groupId);

        // Save the tag-colour combination
        if (!localStorage.getItem(task.color)) {
            localStorage.setItem("tag_" + this.getFirstTag(task.tags), task.color);
        }

        this.hide();
    }

    private getFirstTag(tags: string): string {
        const firstComma = tags.indexOf(",");
        return firstComma > 0 ? tags.substring(0, firstComma) : tags; // If there is no comma, that means there is only one tag, so just get the entire value
    }
}
