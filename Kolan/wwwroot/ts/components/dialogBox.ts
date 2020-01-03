import { LitElement, html, css, property, customElement, TemplateResult } from "lit-element";
import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter";
import { InputType } from "../enums/inputType"
import { InputList } from "./inputList"

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

    constructor() {
        super();
        //this.dialogOptions = dialogOptions;
        //this.id = id;
    }

    render() {
        return html`
         <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
         <div class="dialogBackground"></div>
         <section class="dialog">
            <h2>${html`${this.options.title}`}</h2>
            <div id="inputs">
                ${this.fields.map(x => html`${this.getComponentHtml(x.inputType, x.key, x.value)}`)}
            </div>
            <button @click="${this.submitHandler}">${html`${this.options.primaryButton}`}</button>
            <button class="secondary" @click="${this.cancelHandler}">Cancel</button>
         </section>`;
    }

    updated() {
        this.style.display = this.shown ? "block" : "none";

        // Fire event
        if (this.shown) {
            this.dispatchEvent(new CustomEvent("openDialog"));
            this.onOpen();
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

            if (element instanceof InputList) {
                element.items = values[name];
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
            if (element.name) {
                input[element.name] = element.value;
            }
        }

        return input;
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
            if (element.name) element.value = "";
            else if (element.tagName == "LABEL") element.textContent = "";
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
    private getComponentHtml(inputType: InputType, name: string, value: string): TemplateResult {
        switch (inputType) {
            case InputType.Text:
                return html`<p>${value}:</p>
            <label for="${name}"></label>
            <input type="text" name="${name}" placeholder="${value}..." /><br />`;
            case InputType.TextArea:
                return html`<p>${value}:</p>
            <label for="${name}"></label>
            <textarea name="${name}" placeholder="${value}"></textarea>`;
            case InputType.InputList:
                this.list = new InputList(value);
            let element = this.list as HTMLElement;
            element.setAttribute("name", name);
            return html`${element}`;
            default:
                return html``;
        }
    }
}
