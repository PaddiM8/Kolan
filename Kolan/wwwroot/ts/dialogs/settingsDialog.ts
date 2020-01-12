import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { Board } from "../views/board";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";

declare const viewData;

@customElement("settings-dialog")
export class SettingsDialog extends DialogBox {
    @property({type: Array<object>()}) fields = [
        {
            key: "inputList",
            title: "Edit columns",
            value: "Choose a column name...",
            inputType: InputType.InputList
        }
    ];
    @property({type: Object}) options = {
        title: "Board Settings",
        primaryButton: "Done"
    }

    constructor() {
        super();

        this.addEventListener("itemAdded", (e: CustomEvent) => this.onItemAdded(e));
        this.addEventListener("itemRemoved", (e: CustomEvent) => this.onItemRemoved(e));
    }

    submitHandler() {
        location.reload();
    }

    onOpen() {
        // Collect group names into a list
        const groupNames = [];
        for (const key in Board.tasklistControllers)
            groupNames.push(Board.tasklistControllers[key].name);

        this.list.items = groupNames;
    }

    private onItemAdded(e): void {
        new ApiRequester().send("Groups", "", RequestType.Post, {
            boardId: viewData.id,
            name: e.detail["value"]
        }).catch((err) => console.log(err));
    }

    private onItemRemoved(e): void {
        const index = e.detail["index"];
        const tasklistHead = this.ownerDocument.getElementById("list-head").children[index] as HTMLElement;
        const groupId = tasklistHead.dataset.id;

        new ApiRequester().send("Groups", `${groupId}`, RequestType.Delete, {
            boardId: viewData.id
        }).catch((err) => console.log(err));
    }
}
