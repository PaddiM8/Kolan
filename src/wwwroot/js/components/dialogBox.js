"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lit_element_1 = require("lit-element");
/**
 * Dialog element that takes an IDialogTemplate as input
 * and returns an object with the values as an event.
 */
let DialogBox = class DialogBox extends lit_element_1.LitElement {
    constructor(dialogOptions, id) {
        super();
        this.shown = false;
        this.dialogOptions = dialogOptions;
        this.id = id;
    }
    render() {
        return lit_element_1.html `
        <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
         <div class="dialogBackground"></div>
         <section class="dialog">
            <h2>${lit_element_1.html `${this.dialogOptions.title}`}</h2>
            ${this.dialogOptions.inputs.map(x => lit_element_1.html `<p>${x.value}:</p>
               <input type="text" placeholder="${x.value}..." /><br />`)}
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
        // Fire event
        this.dispatchEvent(new CustomEvent("submitDialog", {
            detail: this.getInputValues()
        }));
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
    getInputValues() {
        let input = {};
        let dialogItems = this.shadowRoot.querySelector(".dialog").children;
        let counter = 0; // Index for each "input" element looped through
        for (let element of dialogItems) {
            if (element.tagName == "INPUT") {
                let key = this.dialogOptions.inputs[counter].key; // Gets the prefered key value for the input element
                input[key] = element.value;
                counter++;
            }
        }
        return input;
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
};
__decorate([
    lit_element_1.property({ type: Boolean })
], DialogBox.prototype, "shown", void 0);
DialogBox = __decorate([
    lit_element_1.customElement('dialog-box')
], DialogBox);
exports.DialogBox = DialogBox;
