"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lit_element_1 = require("lit-element");
const apiRequester_1 = require("../apiRequester");
const requestParameter_1 = require("../requestParameter");
const inputType_1 = require("../enums/inputType");
const inputList_1 = require("./inputList");
/**
 * Dialog element that takes an IDialogTemplate as input
 * and returns an object with the values as an event.
 */
let DialogBox = class DialogBox extends lit_element_1.LitElement {
    constructor(dialogOptions, id) {
        super();
        this.shown = false;
        this.extraRequestParameters = [];
        this.dialogOptions = dialogOptions;
        this.id = id;
    }
    render() {
        return lit_element_1.html `
         <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
         <div class="dialogBackground"></div>
         <section class="dialog">
            <h2>${lit_element_1.html `${this.dialogOptions.title}`}</h2>
            ${this.dialogOptions.inputs.map(x => lit_element_1.html `${this.getComponentHtml(x.inputType, x.value)}`)}
            <button @click="${this.submitHandler}">${lit_element_1.html `${this.dialogOptions.primaryButton}`}</button>
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
            let requestParameters = [...formData["requestParameters"],
                ...this.extraRequestParameters];
            const request = new apiRequester_1.ApiRequester().send(this.dialogOptions.requestAction, this.dialogOptions.requestMethod, this.dialogOptions.requestType, requestParameters);
            request.then(output => {
                const outputJson = JSON.parse(output);
                // Fire event
                this.dispatchEvent(new CustomEvent("submitDialog", {
                    detail: Object.assign(Object.assign({}, outputJson), formData["inputValues"])
                }));
            });
        }
        else {
            // Fire event
            this.dispatchEvent(new CustomEvent("submitDialog", {
                detail: formData["inputValues"]
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
    getFormData() {
        let input = {};
        let requestParameters = [];
        let dialogItems = this.shadowRoot.querySelector(".dialog").children;
        let counter = 0; // Index for each "input" element looped through
        for (const element of dialogItems) {
            if (element.tagName == "INPUT") {
                let key = this.dialogOptions.inputs[counter].key; // Gets the prefered key value for the input element
                input[key] = element.value;
                requestParameters.push(new requestParameter_1.RequestParameter(key, element.value));
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
    hide() {
        let dialogItems = this.shadowRoot.querySelector(".dialog").children;
        for (let element of dialogItems) {
            if (element.tagName == "INPUT")
                element.value = "";
        }
        this.shown = false;
    }
    getComponentHtml(inputType, value) {
        switch (inputType) {
            case inputType_1.InputType.Text:
                return lit_element_1.html `<p>${value}:</p>
                            <input type="text" placeholder="${value}..." /><br />`;
            case inputType_1.InputType.InputList:
                return new inputList_1.InputList(value);
            default:
                return "";
        }
    }
};
__decorate([
    lit_element_1.property({ type: Boolean })
], DialogBox.prototype, "shown", void 0);
__decorate([
    lit_element_1.property({ type: Array() })
], DialogBox.prototype, "extraRequestParameters", void 0);
__decorate([
    lit_element_1.property({ type: Object })
], DialogBox.prototype, "dialogOptions", void 0);
DialogBox = __decorate([
    lit_element_1.customElement('dialog-box')
], DialogBox);
exports.DialogBox = DialogBox;
