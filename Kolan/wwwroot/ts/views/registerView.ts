import { View } from "./view";
import { Crypto, RSAType } from "../processing/crypto";

window.addEventListener("load", () => new RegisterView());

class RegisterView extends View {
    constructor() {
        super();

        const form = document.querySelector("form");
        form.addEventListener("submit", async e => {
            e.preventDefault();

            const usernameInput = document.getElementById("Username") as HTMLInputElement;
            const passwordInput = document.getElementById("Password") as HTMLInputElement;
            const publicKeyInput = document.getElementById("PublicKey") as HTMLInputElement;
            const privateKeyInput = document.getElementById("PrivateKey") as HTMLInputElement;

            // Create the user's public/private key pair. This will also save the keys locally.
            const keyPair = await Crypto.createWrappingKeyPair(passwordInput.value, usernameInput.value);

            // Set the values of the (hidden) input fields to the exported/wrapped keys.
            // These fields are not visible to the user, but their values will be sent to
            // the backend, like with the visible fields.
            publicKeyInput.value = await Crypto.exportRSAKey(keyPair.publicKey);
            privateKeyInput.value = await Crypto.wrapPrivateKey(keyPair.privateKey);

            form.submit();
        });
    }
}
