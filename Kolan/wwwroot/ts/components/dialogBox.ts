import { LitElement, html, css, property, customElement, TemplateResult } from "lit-element";
import { InputType } from "../enums/inputType";
import { DialogType } from "../enums/dialogType";
import { InputList } from "./inputList";
import { ThemeManager } from "../themes/themeManager";
import { DialogOptions, DialogField } from "../models/dialogOptions";

/**
 * Dialog element that takes an IDialogTemplate as input and returns an object with the values as an event.
 *
 */
@customElement('dialog-box')
export class DialogBox extends LitElement {
    @property({type: Boolean}) shown = false;
    @property({type: Array<Object>()}) fields: DialogField[];
    @property({type: Object}) options: DialogOptions;
    protected list: InputList;
    private enterToSubmit = true;
    private submittedAlready = false;

    constructor() {
        super();
    }

    render() {
        const dialogTypeClass = this.options.dialogType == DialogType.Disposable ? "disposable": "";
        const submitButtonClass = this.options.redSubmitButton == true ? "red" : "";

        const componentHtml = html`
         <link rel="stylesheet" type="text/css" href="../css/components/dialog.${ThemeManager.getTheme()}.css">
         <div class="dialogBackground ${dialogTypeClass}"></div>
         <section class="dialog ${dialogTypeClass}">
            <h2>${html`${this.options.title}`}</h2>
            <div id="inputs">
                ${this.fields.map(x => html`${this.getComponentHtml(x)}`)}
            </div>
            <button class="submit ${submitButtonClass}" @click="${this.submit}">${html`${this.options.primaryButton}`}</button>
            <button class="cancel secondary" @click="${this.cancelHandler}">Cancel</button>
         </section>`;

         // Make the form submit when enter is pressed
         // this.enterToSubmit is set to false if an InputList or textarea is present in the form.
         if (this.enterToSubmit) {
             this.addEventListener("keyup", e => {
                 if (e.keyCode == 13) this.submitHandler();
             });
         }

         // Set the default date if relevant
         const dateElements = this.shadowRoot.querySelectorAll("input[type='date']");
         for (const element of dateElements) {
             const dateElement = element as HTMLInputElement;
             if (!dateElement.value) dateElement.valueAsDate = new Date();
             dateElement.min = dateElement.value;
         }

         return componentHtml;
    }

    updated() {
        // Always show disposable dialogs
        if (this.options.dialogType == DialogType.Disposable) this.shown = true;

        // Fire event
        if (this.shown) {
            this.submittedAlready = false;
            this.style.display = "block";
            (this.shadowRoot.querySelector(".dialog") as HTMLElement).style.top = (window.scrollY + 50) + "px";
            this.dispatchEvent(new CustomEvent("openDialog"));
            this.onOpen();
        } else {
            this.style.display = "none";
        }
    }

    /**
     * Set the values of the input fields in the dialog.
     */
    public setValues(values: object): void {
        for (const name in values) {
            const element = this.shadowRoot.querySelector(`[name="${name}"]`);
            const inputElement = element as HTMLInputElement;
            if (!values[name]) continue;
            if (!element) continue;

            if ("type" in element && element["type"] == "date") { // input type="date"
                inputElement.valueAsNumber = values[name];

                // Make sure it's enabled if it has a value
                const checkbox = inputElement.parentElement.querySelector(`.${name}Toggle`) as HTMLInputElement;
                if (checkbox) {
                    const hasValue = values[name] > 0;
                    checkbox.checked = hasValue;
                    inputElement.disabled = !hasValue;
                }
            } else if (element instanceof InputList) { // InputList
                element.items = values[name];
            } else if (element.getAttribute("type") == "checkbox") { // input type="checkbox"
                inputElement.checked = values[name];
            } else {
                element["value"] = values[name];
            }
        }
    }

    /**
    * Submit the dialog
    */
    private submit(): void {
        // Make sure it can only be submitted once
        if (this.submittedAlready) return;
        this.submittedAlready = true;

        this.submitHandler();
    }

    /**
     * When the submit button in the dialog is clicked. Fires the event, hides and clears the dialog
     */
    protected async submitHandler(): Promise<void> {
        // Fire event
        this.dispatchEvent(new CustomEvent("submitDialog", {
            detail: {
                output: this.getFormData()
            }
        }));

        this.hide();
    }

    /**
     * When the cancel button in the dialog is clicked. Hides and clears the dialog.
     */
    protected cancelHandler(): void {
        this.hide();
    }

    /**
    * Fires when a dialog is opened. This is likely overriden.
    */
    protected async onOpen(): Promise<void> {}

    /**
     * Get the user input values.
     */
    protected getFormData(): object {
        let input = {};
        const inputs = <any>this.shadowRoot.getElementById("inputs").children;

        for (const element of inputs) {
            // If it isn't an actual input element
            if (!element.name) {
                if (element.classList.contains("checkboxLabel")) {
                    const checkbox = element.children[0];
                    input[checkbox.name] = checkbox.checked;
                }

                continue;
            }

            // Ignore any value if the element's toggle (if any) is not checked.
            const inputToggle = this.shadowRoot.querySelector(`.${element.name}Toggle`) as HTMLInputElement;
            if (inputToggle && !inputToggle.checked) {
                if (element.type == "date") input[element.name] = 0;
                else                        input[element.name] = null;
                continue;
            }

            // Set the value
            if (element.type == "date") {
                input[element.name] = element.valueAsNumber
            } else if (element.name) {
                input[element.name] = element.value;
            }
        }

        return input;
    }

    /**
    * Get an input element present in the dialog
    */
    protected getInputElement(name: string): HTMLInputElement {
        return this.shadowRoot.querySelector(`input[name="${name}"]`);
    }

    /**
    * Parse an error string (probably sent by the server), and display the corresponding errors above each input element.
    */
    protected showErrors(errorString: string): void {
        const errors = JSON.parse(errorString);
        this.submittedAlready = false;

        for (const name in errors) {
            const label = this.shadowRoot.querySelector(`label[for="${name}"]`) as HTMLLabelElement;
            label.innerHTML = errors[name].join("\n");

            label.style.display = errors[name] ? "inline-block" : "none";
        }
    }

    /**
     * Hide the dialog and clear the values.
     */
    public hide(): void {
        let dialogItems = <any>this.shadowRoot.getElementById("inputs").children;

        for (let element of dialogItems) {
            if (element.classList.contains("checkboxLabel")) {
                // Uncheck any checkboxes
                element.querySelector("input[type='checkbox']").checked = false;
            } else if (element.name) {
                element.value = "";
            } else if (element.tagName == "LABEL") {
                element.textContent = "";
            }
        }

        this.dispatchEvent(new CustomEvent("hideDialog"));
        this.shown = false;

        if (this.options.dialogType == DialogType.Disposable) this.remove();
    }

    /**
     * Create the HTML for a given input type.
     */
    private getComponentHtml(field: DialogField): TemplateResult {
        field.placeholder = field.placeholder == null ? field.value + "..." : field.placeholder; // Set placeholder to title if it's not specified
        const name = field.key;

        const label = field.optional
            ? html`<label class="checkboxLabel">
                       <input type="checkbox"
                              class="${name}Toggle"
                              onchange="this.parentElement.nextElementSibling.nextElementSibling.disabled = !this.checked" />
                              ${field.value}
                   </label>`
            : html`<p>${field.value}</p>`;

        switch (field.inputType) {
            case InputType.Text:
                return html`${label}
                            <label for="${name}" class="error"></label>
                            <input type="text" name="${name}" placeholder="${field.placeholder}" ?disabled=${field.optional} /><br />`;
            case InputType.Password:
                return html`${label}
                            <label for="${name}" class="error"></label>
                            <input type="password" name="${name}" placeholder="${field.placeholder}" ?disabled=${field.optional} /><br />`;
            case InputType.TextArea:
                this.enterToSubmit = false;

                return html`${label}
                            <label for="${name}" class="error"></label>
                            <textarea name="${name}" placeholder="${field.placeholder}" ?disabled=${field.optional}></textarea>`;
            case InputType.InputList:
                this.enterToSubmit = false;

                this.list = new InputList(field.value);
                let listElement = this.list as HTMLElement;
                listElement.setAttribute("name", name);
                return html`<h3>${field.title}</h3>${listElement}`;
            case InputType.Checkbox:
                return html`<label class="checkboxLabel" class="error"><input type="checkbox" name="${name}" />${field.value}</label>`
            case InputType.Color:
                return html`<p style="display: inline-block;">${field.value}:</p>
                            <label for="${name}" class="error"></label>
                            <input type="color" name="${name}" /><br />`;
            case InputType.Date:
                return html`${label}
                            <label for="${name}" class="error"></label>
                            <input type="date" name="${name}" ?disabled=${field.optional} /><br />`;
            case InputType.Button:
                const additionalClassName = field.red ? "red" : "";
                return html`${label}
                            <button class="${name} ${additionalClassName}">${field.value}</button>`;
            default:
                return html``;
        }
    }
}
