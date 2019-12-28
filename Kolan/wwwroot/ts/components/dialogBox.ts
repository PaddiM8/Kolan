import { LitElement, html, css, property, customElement, TemplateResult } from "lit-element";
import { IDialogTemplate } from "../dialogs/IDialogTemplate";
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
    @property({type: Array<RequestParameter>()}) extraRequestParameters = [];
    @property({type: Object}) dialogOptions: IDialogTemplate
    list: InputList;

    constructor(dialogOptions, id) {
        super();
        this.dialogOptions = dialogOptions;
        this.id = id;
    }

    render() {
        return html`
         <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
         <div class="dialogBackground"></div>
         <section class="dialog">
            <h2>${html`${this.dialogOptions.title}`}</h2>
            <div id="inputs">
                ${this.dialogOptions.inputs.map(x => html`${this.getComponentHtml(x.inputType, x.key, x.value)}`)}
            </div>
            <button @click="${this.submitHandler}">${html`${this.dialogOptions.primaryButton}`}</button>
            <button class="secondary" @click="${this.cancelHandler}">Cancel</button>
         </section>`;
    }

    updated() {
        this.style.display = this.shown ? "block" : "none";

        // Fire event
        if (this.shown) {
            this.dispatchEvent(new CustomEvent("openDialog"));
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
    private submitHandler(): void {
        let formData = this.getFormData();

        // Do request
        if (this.dialogOptions.requestAction != undefined) // Not all dialogs do requests
        {
            let requestParameters: RequestParameter[] = [...formData["requestParameters"], 
                ...this.extraRequestParameters];
            const request = new ApiRequester().send(
                this.dialogOptions.requestAction,
                this.dialogOptions.requestMethod,
                this.dialogOptions.requestType,
                requestParameters
            );

            // Fire the event after the request was successful, and include the returned information
            request.then(output => {
                const outputObject = JSON.parse(output as string);

                // Fire event
                this.dispatchEvent(new CustomEvent("submitDialog", {
                    detail: { output: outputObject, input: formData["inputValues"] }
                }));
            });
        } else {
            // Fire event
            this.dispatchEvent(new CustomEvent("submitDialog", {
                detail: { output: formData["inputValues"] }
            }));
        }

        this.hide();
    }

    /**
     * When the cancel button in the dialog is clicked. Hides and clears the dialog.
     *
     * @name cancelHandler
     * @function
     * @returns {void}
     */
    private cancelHandler(): void {
        this.hide();
    }

    /**
     * Get the user input values.
     *
     * @name getFormData
     * @function
     * @returns {object}
     */
    private getFormData(): object {
        let input = {};
        let requestParameters: RequestParameter[] = [];
        const inputs = <any>this.shadowRoot.getElementById("inputs").children;
        for (const element of inputs) {
            if (element.name) {
                input[element.name] = element.value;
                requestParameters.push(new RequestParameter(element.name, element.value));
            }
        }

        return {
            inputValues: input,
            requestParameters: requestParameters
        };
    }

    /**
     * Hide the dialog and clear the values.
     *
     * @name hide
     * @function
     * @returns {void}
     */
    private hide(): void {
        let dialogItems = <any>this.shadowRoot.getElementById("inputs").children;
        for (let element of dialogItems) {
            if (element.name) element.value = "";
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
            <input type="text" name="${name}" placeholder="${value}..." /><br />`;
            case InputType.TextArea:
                return html`<p>${value}:</p>
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
