import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";
import { RequestType } from "../enums/requestType";
import { ApiRequester } from "../communication/apiRequester";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";
import { Board } from "../views/board";

declare const viewData;

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

    protected onOpen(): void {
        new ApiRequester().send("Boards", `${viewData.id}/Users`, RequestType.Get)
        .then(response => {
            this.list.items = JSON.parse(response as string);
        });
    }

    submitHandler(): void {
        const isPublic = this.getFormData()["public"];
        new ApiRequester().send("Boards", `${viewData.id}/ChangePublicity`, RequestType.Post, {
            publicity: isPublic
        });

        Board.content.public = isPublic;

        this.hide();
    }

    private onUserAdded(e): void {
        new ApiRequester().send("Boards", `${viewData.id}/Users`, RequestType.Post, {
            username: e.detail["value"]
        })
        .then(() => {
            ToastController.new("Collaborator added", ToastType.Info);
        })
        .catch(() => {
            ToastController.new("Failed to add collaborator", ToastType.Error);
            e.detail["object"].undo();
        })
    }

    private onUserRemoved(e): void {
        new ApiRequester().send("Boards", `${viewData.id}/Users`, RequestType.Delete, {
            username: e.detail["value"]
        })
        .then(() => {
            ToastController.new("Collaborator removed", ToastType.Info);
        });
    }
}
