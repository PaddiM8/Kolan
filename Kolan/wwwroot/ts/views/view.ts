import { ThemeManager } from "../themes/themeManager";

export class View {
    constructor() {
        ThemeManager.injectStyle();
    }

    protected showFormErrors(form: HTMLFormElement, errorString: string): void {
        const errors = JSON.parse(errorString);
        const labels = document.querySelectorAll("label") as NodeListOf<HTMLLabelElement>;

        // Clear pre-existing labels
        for (const label of labels) {
            label.innerHTML = "";
            label.style.display = "none";
        }

        // Display errors
        for (const field in errors) {
            const element = form.querySelector(`label[for="${field}Input"]`) as HTMLLabelElement;
            element.innerHTML = errors[field].join("\n");
            element.style.display = "inline-block";
        }
    }
}
