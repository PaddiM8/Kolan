"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lit_element_1 = require("lit-element");
let InputList = class InputList extends lit_element_1.LitElement {
    render() {
        this.items = ["Testing", "Hhuehueehu"];
        return lit_element_1.html `
        <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
        <style>
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
                border: 1px solid gray;
                list-style: none;
                margin-left: 0;
                padding-left: 0;
            }

            :host ul li {
                padding: 15px;
                border-bottom: 1px solid gray;
            }
        </style>
        <section class="inputBlock">
            <input type="text" placeholder="Add item" />
            <button>Add</button>
        </section>
        <ul>
            ${this.items.map((item) => lit_element_1.html `
                <li>${item}</li>
            `)}
        </ul>
        `;
    }
};
__decorate([
    lit_element_1.property({ type: Array() })
], InputList.prototype, "items", void 0);
InputList = __decorate([
    lit_element_1.customElement("input-list")
], InputList);
exports.InputList = InputList;
