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
        this.list.items = Board.collaborators.map(x => ({ name: x }));
    }

    submitHandler(): void {
        const isPublic = this.getFormData()["public"];
        ApiRequester.send("Boards", `${viewData.id}/ChangePublicity`, RequestType.Post, {
            publicity: isPublic
        });

        Board.content.public = isPublic;

        this.hide();
    }

    private onUserAdded(e): void {
        ApiRequester.send("Boards", `${viewData.id}/Users`, RequestType.Post, {
            username: e.detail["value"]
        })
        .then(() => {
            Board.collaborators.push(e.detail["value"])
            ToastController.new("Collaborator added", ToastType.Info);
        })
        .catch(() => {
            ToastController.new("Failed to add collaborator", ToastType.Error);
            e.detail["object"].undoAdd();
        })
    }

    private onUserRemoved(e): void {
        ApiRequester.send("Boards", `${viewData.id}/Users`, RequestType.Delete, {
            username: e.detail["item"].name
        })
        .then(() => {
            ToastController.new("Collaborator removed", ToastType.Info);
        });
    }
}
