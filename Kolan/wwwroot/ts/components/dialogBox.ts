import { LitElement, html, css, property, customElement, TemplateResult } from "lit-element";
import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter";
import { InputType } from "../enums/inputType"
import { InputList } from "./inputList"
import { ThemeManager } from "../themes/themeManager"
import { IModelError } from "../models/IModelError"

/**
 * Dialog element that takes an IDialogTemplate as input and returns an object with the values as an event.
 *
 * @name customElement
 * @function
 * @param 'dialog-box'
 * @returns {undefined}
 */
@customElement('dialog-box')
export class DialogBox extends LitElement {
    @property({type: Boolean}) shown = false;
    @property({type: Array<object>()}) fields;
    @property({type: String}) options;
    protected list: InputList;
    private enterToSubmit = true;

    constructor() {
        super();
    }

    render() {
        const componentHtml = html`
         <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
         <link rel="stylesheet" type="text/css" href="../css/themes/${ThemeManager.getTheme()}.css">
         <div class="dialogBackground"></div>
         <section class="dialog">
            <h2>${html`${this.options.title}`}</h2>
            <div id="inputs">
                ${this.fields.map(x => html`${this.getComponentHtml(x.inputType, x.key, x.value, x.title, x.placeholder)}`)}
            </div>
            <button @click="${this.submitHandler}">${html`${this.options.primaryButton}`}</button>
            <button class="secondary" @click="${this.cancelHandler}">Cancel</button>
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
             dateElement.valueAsDate = new Date();
             dateElement.min = dateElement.value;
         }

         return componentHtml;
    }

    updated() {
        this.style.display = this.shown ? "block" : "none";

        // Fire event
        if (this.shown) {
            this.dispatchEvent(new CustomEvent("openDialog"));
            this.onOpen();
            window.scrollTo(0, 0);
        }
    }

    /**
     * Set the values of the input fields in the dialog.
     *
     * @name setValues
     * @function
     * @param {object} values
     * @returns {void}
     */
    public setValues(values: object): void { // TODO: Type safety
        for (const name in values) {
            const element = this.shadowRoot.querySelector(`[name="${name}"]`);
            if (!values[name]) continue;

            if (element instanceof InputList) {
                element.items = values[name];
            } else if (element.getAttribute("type") == "checkbox") {
                (element as HTMLInputElement).checked = values[name];
            } else {
                element["value"] = values[name];
            }
        }
    }

    /**
     * When the submit button in the dialog is clicked. Fires the event, hides and clears the dialog
     *
     * @name submitHandler
     * @function
     * @returns {void}
     */
    protected submitHandler(): void {
        let formData = this.getFormData();

        // Fire event
        this.dispatchEvent(new CustomEvent("submitDialog", {
            detail: { output: formData["inputValues"] }
        }));

        this.hide();
    }

    /**
     * When the cancel button in the dialog is clicked. Hides and clears the dialog.
     *
     * @name cancelHandler
     * @function
     * @returns {void}
     */
    protected cancelHandler(): void {
        this.hide();
    }

    protected onOpen(): void {}

    /**
     * Get the user input values.
     *
     * @name getFormData
     * @function
     * @returns {object}
     */
    protected getFormData(): object {
        let input = {};
        const inputs = <any>this.shadowRoot.getElementById("inputs").children;
        for (const element of inputs) {
            if (element.type == "date") {
                input[element.name] = element.valueAsDate;
            } else if (element.name) {
                input[element.name] = element.value;
            } else if (element.classList.contains("checkboxLabel")) {
                const checkbox = element.children[0];
                input[checkbox.name] = checkbox.checked;
            }
        }

        return input;
    }

    protected getInputElement(name: string): HTMLInputElement {
        return this.shadowRoot.querySelector(`input[name="${name}"]`);
    }

    protected showErrors(errorString: string): void {
        const errors = JSON.parse(errorString);

        for (const name in errors) {
            const label = this.shadowRoot.querySelector(`label[for="${name}"]`) as HTMLLabelElement;
            label.innerHTML = errors[name].join("\n");

            label.style.display = errors[name] ? "inline" : "none";
        }
    }

    /**
     * Hide the dialog and clear the values.
     *
     * @name hide
     * @function
     * @returns {void}
     */
    public hide(): void {
        let dialogItems = <any>this.shadowRoot.getElementById("inputs").children;
        for (let element of dialogItems) {
            if (element.classList.contains("checkboxLabel")) {
                element.querySelector("input[type='checkbox']").checked = false;
            } else if (element.name) {
                element.value = "";
            } else if (element.tagName == "LABEL") {
                element.textContent = "";
            }
        }

        this.shown = false;
    }

    /**
     * Create the HTML for a given input type.
     *
     * @name getComponentHtml
     * @function
     * @param {InputType} inputType
     * @param {string} name
     * @param {string} value
     * @returns {TemplateResult}
     */
    private getComponentHtml(inputType: InputType, name: string, value: string, title: string = null, placeholder: string = null): TemplateResult {
        placeholder = placeholder == null ? value + "..." : placeholder; // Set placeholder to title if it's not specified

        switch (inputType) {
            case InputType.Text:
                return html`<p>${value}:</p>
                            <label for="${name}" class="error"></label>
                            <input type="text" name="${name}" placeholder="${placeholder}" /><br />`;
            case InputType.TextArea:
                this.enterToSubmit = false;

                return html`<p>${value}:</p>
                            <label for="${name}" class="error"></label>
                            <textarea name="${name}" placeholder="${placeholder}"></textarea>`;
            case InputType.InputList:
                this.enterToSubmit = false;

                this.list = new InputList(value);
                let listElement = this.list as HTMLElement;
                listElement.setAttribute("name", name);
                return html`<h3>${title}</h3>${listElement}`;
            case InputType.Checkbox:
                return html`<label class="checkboxLabel" class="error"><input type="checkbox" name="${name}" />${value}</label>`
            case InputType.Color:
                return html`<p style="display: inline-block;">${value}:</p>
                            <label for="${name}" class="error"></label>
                            <input type="color" name="${name}" /><br />`;
            case InputType.Date:
                return html`<p>Deadline:</p>
                            <label for="${name}" class="error"></label>
                            <input type="date" name="${name}" /><br />`;
            default:
                return html``;
        }
    }
}
