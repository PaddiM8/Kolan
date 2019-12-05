"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lit_element_1 = require("lit-element");
require("fa-icons");
let InputList = class InputList extends lit_element_1.LitElement {
    constructor(inputPlaceholder) {
        super();
        this.items = ["Testing", "Hhuehueehu"];
        this.inputPlaceholder = inputPlaceholder;
    }
    render() {
        return lit_element_1.html `
        <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
        <style>
            :host {
                font-family: "Inter", sans-serif;
            }

            :host .inputBlock {
                display: flex;
                flex-wrap: nowrap;
            }

            :host input {
                flex: 1;
                margin-bottom: 0;
                margin-right: 7px;
            }

            :host button {
            }

            :host ul {
                width: 100%;
                height: 400px;
                border: 1px solid #9e9e9e;
                list-style: none;
                margin-left: 0;
                padding-left: 0;
            }

            :host ul li {
                padding: 15px;
                border-bottom: 1px solid #9e9e9e;
            }

            :host li fa-icon {
                float: right;
                cursor: pointer;
            }
        </style>
        <section class="inputBlock">
            <input id="textInput" type="text" placeholder="${this.inputPlaceholder}" />
            <button @click="${(e) => this.addItem(e.srcElement.parentElement.querySelector("input"))}">Add</button>
        </section>
        <ul>
            ${this.items.map((item, index) => this.createItem(item, index))}
        </ul>
        `;
    }
    createItem(value, index) {
        return lit_element_1.html `
            <li data-value="${value}">
                <span class="itemValue">${value}</span>
                <fa-icon class="fas fa-times"
                         size="20px"
                         path-prefix="/node_modules"
                         @mouseover="${this.handleIconMouseOver}"
                         @mouseout="${this.handleIconMouseOut}"
                         @click="${this.handleIconClick}"
                         </fa-icon>
            </li>`;
    }
    addItem(inputElement) {
        const value = inputElement.value;
        if (value.length == 0)
            return; // Don't add it if the input is empty
        this.items = [...this.items, value];
        inputElement.value = "";
        this.dispatchEvent(new CustomEvent("itemAdded", {
            bubbles: true,
            composed: true,
            detail: value
        }));
    }
    handleIconMouseOver(e) {
        e.srcElement.color = "red";
    }
    handleIconMouseOut(e) {
        e.srcElement.color = "black";
    }
    handleIconClick(e) {
        const itemElement = e.srcElement.parentElement;
        const itemValue = itemElement.dataset.value;
        this.items = this.items.filter((item, index) => item != itemValue); // Remove from list, give back a list without the item. Needs optimization.
        this.dispatchEvent(new CustomEvent("itemRemoved", {
            bubbles: true,
            composed: true,
            detail: itemValue
        }));
    }
};
__decorate([
    lit_element_1.property({ type: Array() })
], InputList.prototype, "items", void 0);
InputList = __decorate([
    lit_element_1.customElement("input-list")
], InputList);
exports.InputList = InputList;
