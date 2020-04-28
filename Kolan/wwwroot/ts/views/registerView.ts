import { View } from "./view";
import { Crypto, RSAType } from "../processing/crypto";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";

window.addEventListener("load", () => new RegisterView());

class RegisterView extends View {
    constructor() {
        super();

        const form = document.querySelector("form");
        form.addEventListener("submit", async e => {
            e.preventDefault();

            const email = (document.getElementById("emailInput") as HTMLInputElement).value;
            const username = (document.getElementById("usernameInput") as HTMLInputElement).value;
            const password = (document.getElementById("passwordInput") as HTMLInputElement).value;
            const repeatPassword = (document.getElementById("repeatPasswordInput") as HTMLInputElement).value;

            // Create the user's public/private key pair. This will also save the keys locally.
            const keyPair = await Crypto.createWrappingKeyPair(password, username);
            console.log(await Crypto.exportRSAKey(keyPair.publicKey));
            console.log(await Crypto.wrapPrivateKey(keyPair.privateKey));

            ApiRequester.send("Users", "Create", RequestType.Post, {
                email: email,
                username: username,
                password: password,
                repeatPassword: repeatPassword,
                publicKey: await Crypto.exportRSAKey(keyPair.publicKey),
                privateKey: await Crypto.wrapPrivateKey(keyPair.privateKey)
            })
            .then(() => location.href = "/")
            .catch(err => this.showFormErrors(form, err.response));
        });
    }
}
