import { DialogBox } from "../components/dialogBox";
import { ConfirmDialog } from "./confirmDialog";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { Board } from "../views/board";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";
import { ToastType } from "../enums/toastType";
import { ToastController } from "../controllers/toastController";
import { PermissionLevel } from "../enums/permissionLevel";
import { ContentFormatter } from "../processing/contentFormatter";

declare const viewData;

@customElement("settings-dialog")
export class SettingsDialog extends DialogBox {
    @property({type: Array<object>()}) fields = [
        {
            key: "name",
            value: "Title",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Description",
            inputType: InputType.TextArea
        },
        {
            key: "inputList",
            title: "Edit columns",
            value: "Choose a column name...",
            inputType: InputType.InputList
        },
        {
            key: "deleteBoard",
            value: "Delete board",
            inputType: InputType.Button
        }
    ];
    @property({type: Object}) options = {
        title: "Board Settings",
        primaryButton: "Done"
    }
    private itemHasBeenMoved = false;
    private contentHasChanged = false;

    constructor() {
        super();

        this.addEventListener("itemAdded", (e: CustomEvent) => this.onItemAdded(e));
        this.addEventListener("itemRemoved", (e: CustomEvent) => this.onItemRemoved(e));
        this.addEventListener("itemMoved", () => this.itemHasBeenMoved = true);
    }

    submitHandler() {
        // If eg. name or description has been changed, update this information.
        if (this.contentHasChanged) {
            const formData = this.getFormData();
            Board.content.name = formData["name"];
            Board.content.description = formData["description"];

            ContentFormatter.boardPreBackend(Board.content, Board.getRootId()).then(processedBoard => {
                // parentId is empty if there is no parent. The backend will understand this.
                const parentId = Board.ancestors.length > 0 ? Board.ancestors[Board.ancestors.length - 1] : Board.id;
                ApiRequester.send("Boards", Board.id, RequestType.Put, {
                    parentId: parentId,
                    newBoardContent: JSON.stringify(processedBoard)
                }).then(x => {
                    location.reload();
                }).catch(err => {
                    this.showErrors(JSON.parse(err.response));
                });
            });
        }

        // Send a request to change the group order only if it has been changed.
        if (this.itemHasBeenMoved) {
            ApiRequester.send("Boards", `${Board.id}/ChangeGroupOrder`, RequestType.Post, {
                groupIds: JSON.stringify(this.list.items.map(x => x.id))
            })
            .then(() => Board.boardHub.requestReload().then(() => location.reload())); // It won't automatically reload since the dialog is open
        }

        if (!this.contentHasChanged && !this.itemHasBeenMoved) this.hide();
    }

    onOpen() {
        // Change delete button to leave button if the board isn't owned by the user.
        const deleteButton = this.shadowRoot.querySelector(".deleteBoard");
        if (Board.permissionLevel != PermissionLevel.All) {
            if (Board.ancestors[-1].id) {
                deleteButton.previousElementSibling.remove();
                deleteButton.remove();
            } else {
                deleteButton.previousElementSibling.innerHTML = "Leave board";
                deleteButton.innerHTML = "Leave";
                deleteButton.addEventListener("click", () => this.leaveBoard());
            }
        } else {
            deleteButton.addEventListener("click", () => this.deleteBoard());
        }

        const name = this.shadowRoot.querySelector("[name='name']") as HTMLInputElement;
        const description = this.shadowRoot.querySelector("[name='description']") as HTMLInputElement;

        // Set the values
        // TODO: Use the dialogbox.setValues() function for this...
        name.value = Board.content.name;
        description.value = Board.content.description;
        name.oninput = () => this.contentHasChanged = true;
        description.oninput = () => this.contentHasChanged = true;

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

    private deleteBoard(): void {
        const confirmDialog = new ConfirmDialog("Are you sure you want to delete the board?", "Yes");
        document.body.appendChild(confirmDialog);

        confirmDialog.addEventListener("submitDialog", () => {
            // If it's not a root board
            const parentId = Board.ancestors.length > 0 ? Board.ancestors[-1].id : null;
            if (Board.ancestors.length > 0) {
                ApiRequester.send("Boards", parentId, RequestType.Delete, {
                    boardId: Board.id
                }).then(() => location.href = `/Board/${parentId}`);
            } else {
                ApiRequester.send("Boards", "", RequestType.Delete, {
                    id: Board.id
                }).then(() => location.href = `/`);
            }
        });
    }

    private leaveBoard(): void {
        ApiRequester.send("Boards", `${Board.id}/Users`, RequestType.Delete, {
            username: viewData.username
        }).then(() => {
            location.href = "/";
        });
    }

    private onItemAdded(e): void {
        ApiRequester.send("Groups", "", RequestType.Post, {
            boardId: Board.id,
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

        ApiRequester.send("Groups", `${groupId}`, RequestType.Delete, {
            boardId: Board.id
        })
        .catch((err) => console.log(err));
    }
}
