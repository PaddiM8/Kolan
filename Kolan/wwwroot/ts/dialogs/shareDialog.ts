import { DialogBox } from "../components/dialogBox";
import { property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { RequestType } from "../enums/requestType";
import { ApiRequester } from "../communication/apiRequester";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";
import { BoardView } from "../views/boardView";
import { PermissionLevel } from "../enums/permissionLevel";
import { Crypto, RSAType } from "../processing/crypto";

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

        if (BoardView.content.encrypted) {
            // Encrypted boards cannot be made public.
            this.shadowRoot.querySelector("input[name='public'").parentElement.style.display = "none";
        }

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
            const username = e.detail["value"];
            let encryptionKey: string;

            if (BoardView.content.encrypted) {
                // Get the added user's public key
                const response = await ApiRequester.send("Users", `${username}/PublicKey`, RequestType.Get);

                // Import the public key so that it can be used
                const publicKey = await Crypto.importRSAKey(JSON.parse(response).key, RSAType.Public)

                // Wrap the board's encryption key using the added user's public key,
                // so that they can unwrap it using their own private key.
                encryptionKey = await Crypto.wrapAnyKey(
                    BoardView.content.cryptoKey,
                    publicKey
                );
            }
            
            await ApiRequester.send("Boards", `${BoardView.id}/Users`, RequestType.Post, {
                username: username,
                encryptionKey: encryptionKey // If encryption is not enabled on the board, this will simply be null.
            });

            BoardView.collaborators.push(username);
            ToastController.new("Collaborator added", ToastType.Info);
        } catch (err) {
            ToastController.new("Failed to add collaborator", ToastType.Error);
            e.detail["object"].undoAdd();
            console.log(err);
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
