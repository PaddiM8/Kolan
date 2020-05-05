import { View } from "./view";
import { Crypto, RSAType } from "../processing/crypto";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";
import { RedirectTo } from "./redirectTo";

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

            ApiRequester.users.add(
                email,
                username,
                password,
                repeatPassword
            ).then(() => RedirectTo.Login())
             .catch(err => this.showFormErrors(form, err.response));
        });
    }
}
