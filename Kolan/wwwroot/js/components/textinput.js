"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lit_element_1 = require("lit-element");
let TextInput = class TextInput extends lit_element_1.LitElement {
    constructor() {
        super(...arguments);
        this.placeholder = "";
        this.type = "";
    }
    render() {
        return lit_element_1.html `
      <style>
         :host input {
            padding: 10px 12px 10px 12px;
            font-size: 1.2em;
            font-family: 'Inter', sans-serif;
            font-weight: 300;
            margin-bottom: 15px;
            box-sizing: border-box;
            background-color: $white;
            color: black;
            border: 1px solid #9e9e9e;
            transition: .3s ease border-color;
         }

         :host input:focus {
            border: 1px solid #0062ff;
         }
      </style>
      <input type="text" placeholder="${lit_element_1.html `${this.placeholder}`} />"
    `;
    }
};
__decorate([
    lit_element_1.property()
], TextInput.prototype, "placeholder", void 0);
__decorate([
    lit_element_1.property()
], TextInput.prototype, "type", void 0);
TextInput = __decorate([
    lit_element_1.customElement("text-input")
], TextInput);
