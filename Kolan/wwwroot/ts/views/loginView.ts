import { View } from "./view";
import { Crypto } from "../processing/crypto";

window.addEventListener("load", () => new LoginView());

class LoginView extends View {
    constructor() {
        super();

        const spans = document.querySelectorAll("form > label > span") as NodeListOf<HTMLSpanElement>;
        for (const span of spans) {
            if (span.innerHTML) span.parentElement.style.display = "inline-block";
        }

        const form = document.querySelector("form");
        form.addEventListener("submit", e => {
            e.preventDefault();
            const username = (document.getElementById("Username") as HTMLInputElement).value;
            const password = (document.getElementById("Password") as HTMLInputElement).value;

            // Create and save an encryption key using the password
            Crypto.setWrappingKey(password, username).then(() => {
                form.submit();
            });
        });
    }
}
