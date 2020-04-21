import { DialogBox } from "../components/dialogBox";
import { property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { RequestType } from "../enums/requestType";
import { ApiRequester } from "../communication/apiRequester";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";
import { BoardView } from "../views/boardView";
import { PermissionLevel } from "../enums/permissionLevel";


@customElement("share-dialog")
export class ShareDialog extends DialogBox {
    @property({type: Array<object>()}) fields = [
        {
            key: "public",
            value: "Anyone can view",
            inputType: InputType.Checkbox
        },
        {
            key: "inputList",
            title: "Add collaborators",
            value: "Name of user",
            inputType: InputType.InputList
        }
    ];
    @property({type: Object}) options = {
        title: "Share",
        primaryButton: "Done"
    }

    constructor() {
        super();

        this.addEventListener("itemAdded", (e: CustomEvent) => this.onUserAdded(e));
        this.addEventListener("itemRemoved", (e: CustomEvent) => this.onUserRemoved(e));
    }

    async onOpen(): Promise<void> {
        this.list.removableItems = BoardView.permissionLevel == PermissionLevel.All;
        this.list.items = BoardView.collaborators.map(x => ({ name: x }));
    }

    async submitHandler(): Promise<void> {
        const isPublic = this.getFormData()["public"];
        await ApiRequester.send("Boards", `${BoardView.id}/ChangePublicity`, RequestType.Post, {
            publicity: isPublic
        });

        BoardView.content.public = isPublic;

        this.hide();
    }

    private async onUserAdded(e: CustomEvent): Promise<void> {
        try {
            await ApiRequester.send("Boards", `${BoardView.id}/Users`, RequestType.Post, {
                username: e.detail["value"]
            });

            BoardView.collaborators.push(e.detail["value"])
            ToastController.new("Collaborator added", ToastType.Info);
        } catch {
            ToastController.new("Failed to add collaborator", ToastType.Error);
            e.detail["object"].undoAdd();
        }
    }

    private async onUserRemoved(e): Promise<void> {
        try {
            await ApiRequester.send("Boards", `${BoardView.id}/Users`, RequestType.Delete, {
                username: e.detail["item"].name
            });

            ToastController.new("Collaborator removed", ToastType.Info);
        } catch {
            ToastController.new("Failed to remove collaborator", ToastType.Error);
            e.detail["object"].undoRemove();
        }
    }
}
