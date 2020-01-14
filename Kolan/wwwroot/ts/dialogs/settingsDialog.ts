import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { Board } from "../views/board";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";
import { ToastType } from "../enums/toastType";
import { ToastController } from "../controllers/toastController";

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
    private itemHasBeenMoved = false;

    constructor() {
        super();

        this.addEventListener("itemAdded", (e: CustomEvent) => this.onItemAdded(e));
        this.addEventListener("itemRemoved", (e: CustomEvent) => this.onItemRemoved(e));
        this.addEventListener("itemMoved", () => this.itemHasBeenMoved = true);
    }

    submitHandler() {
        if (this.itemHasBeenMoved) {
            new ApiRequester().send("Boards", `${viewData.id}/ChangeGroupOrder`, RequestType.Post, {
                groupIds: JSON.stringify(this.list.items.map(x => x.id))
            })
            .then(() => location.reload());
        } else {
            location.reload();
        }
    }

    onOpen() {
        // Collect group names into a list
        const groupNames = [];
        for (const key in Board.tasklistControllers)
            groupNames.push({
                id: key,
                name: Board.tasklistControllers[key].name
            });

        this.list.items = groupNames;
        this.list.draggableItems = true;
    }

    private onItemAdded(e): void {
        new ApiRequester().send("Groups", "", RequestType.Post, {
            boardId: viewData.id,
            name: e.detail["value"]
        })
        .then((req) => {
            this.list.items[this.list.items.length - 1].id = JSON.parse(req).id;
        })
        .catch((err) => console.log(err));
    }

    private onItemRemoved(e): void {
        const groupId = e.detail["item"].id;

        if (Board.tasklistControllers[groupId].tasklist.children.length > 0) {
            ToastController.new("Can only remove empty task lists.", ToastType.Warning);
            e.detail["object"].undoRemove();
        }

        new ApiRequester().send("Groups", `${groupId}`, RequestType.Delete, {
            boardId: viewData.id
        })
        .catch((err) => console.log(err));
    }
}
