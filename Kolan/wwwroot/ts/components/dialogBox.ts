import { LitElement, html, css, property, customElement } from "lit-element";
import { IDialogTemplate } from "../dialogs/IDialogTemplate";
import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter";
import { InputType } from "../enums/inputType"
import { InputList } from "./inputList"

/**
 * Dialog element that takes an IDialogTemplate as input
 * and returns an object with the values as an event.
 */
@customElement('dialog-box')
export class DialogBox extends LitElement {
    @property({type: Boolean}) shown = false;
    @property({type: Array<RequestParameter>()}) extraRequestParameters = [];
    @property({type: Object}) dialogOptions: IDialogTemplate

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
            ${this.dialogOptions.inputs.map(x => html`${this.getComponentHtml(x.inputType, x.value)}`)}
            <button @click="${this.submitHandler}">${html`${this.dialogOptions.primaryButton}`}</button>
            <button class="secondary" @click="${this.cancelHandler}">Cancel</button>
         </section>`;
    }

    updated() {
        this.style.display = this.shown ? "block" : "none";
    }

    /**
     * When the submit button in the dialog is clicked. Fires the event, hides
     * and clears the dialog
     */
    submitHandler() {
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

    /** When the cancel button in the dialog is clicked. Hides and clears
     * the dialog
     */
    cancelHandler() {
        this.hide();
    }

    /** Get user input in the dialog
     */
    private getFormData() {
        let input = {};
        let requestParameters: RequestParameter[] = [];
        let dialogItems = <any>this.shadowRoot.querySelector(".dialog").children;
        let counter = 0; // Index for each "input" element looped through
        for (const element of dialogItems) {
            if (element.tagName == "INPUT") {
                let key = this.dialogOptions.inputs[counter].key; // Gets the prefered key value for the input element
                input[key] = element.value;
                requestParameters.push(new RequestParameter(key, element.value));
                counter++;
            }
        }

        return {
            inputValues: input,
            requestParameters: requestParameters
        };
    }

    /** Hide the dialog and clear the values
     */
    private hide() {
        let dialogItems = <any>this.shadowRoot.querySelector(".dialog").children;
        for (let element of dialogItems) {
            if (element.tagName == "INPUT")
                element.value = "";
        }

        this.shown = false;
    }

    /**
     * Create the HTML for a given input type.
     * @param inputType Type of input element
     * @param value Value (if any) the element should start with
     */
    private getComponentHtml(inputType: InputType, value: string) {
        switch (inputType) {
            case InputType.Text:
                return html`<p>${value}:</p>
                            <input type="text" placeholder="${value}..." /><br />`;
            case InputType.InputList:
                return new InputList(value);
            default:
                return "";
        }
    }
}
