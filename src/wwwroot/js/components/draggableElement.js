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
 * Lit-element that can be dragged and dropped. Needs a <tasklist> parent
 * and a <section> grandparent. Place a <placeholder> element inside the section
 * and style it as you wish.
 */
let Draggable = class Draggable extends lit_element_1.LitElement {
    /**
     * Lit-element that can be dragged and dropped. Needs a <tasklist> parent
     * and a <section> grandparent. Place a <placeholder> element inside the section
     * and style it as you wish.
     */
    constructor() {
        super(...arguments);
        this.placeholder = "placeholder";
        this.mouseIsDown = false;
        this.startPos = { X: 0, Y: 0 };
        this.detached = false;
    }
    static get styles() {
        return lit_element_1.css `
      :host {
        display: block;
        -moz-user-select: none;
        user-select: none;
      }
    `;
    }
    render() {
        return lit_element_1.html `<slot></slot>`;
    }
    firstUpdated(changedProperties) {
        let dragger = this.querySelector(".dragger");
        if (dragger == undefined)
            dragger = this;
        dragger.addEventListener("click", () => this.mouseIsDown = false); // otherwise it won't let go when you click
        dragger.addEventListener('mousedown', e => this.onMouseDown(e));
        document.body.addEventListener('mouseup', () => {
            if (this.detached)
                this.onMouseUp(this);
        });
        document.body.addEventListener('mousemove', e => {
            if (this.mouseIsDown)
                this.onMouseMove(e);
        });
    }
    onMouseDown(e) {
        this.mouseIsDown = true;
        this.startPos = {
            X: e.clientX - this.getBoundingClientRect().left,
            Y: e.clientY - this.getBoundingClientRect().top
        };
    }
    onMouseUp(element) {
        element.mouseIsDown = false;
        const elementsUnder = element.getRelatedElementsUnder();
        // Attach element
        element.style.position = "";
        element.style.width = "";
        element.style.top = "";
        element.style.left = "";
        // Move to placeholder
        const placeholder = element.parentElement.parentElement.querySelector(this.placeholder);
        elementsUnder.taskList.insertBefore(element, placeholder);
        placeholder.style.display = "none";
        element.detached = false;
    }
    onMouseMove(e) {
        // Detach from list
        if (!this.detached) {
            const computedStyle = getComputedStyle(this);
            // Placeholder
            const placeholder = this.parentElement.parentElement.querySelector(this.placeholder);
            this.parentElement.insertBefore(placeholder, this); // Move placeholder to list slot
            Object.assign(placeholder.style, {
                width: computedStyle.width,
                height: computedStyle.height,
                display: "block"
            });
            // Draggable
            this.parentElement.parentElement.appendChild(this); // Move task out from tasklists, then get position: fixed
            this.style.width = computedStyle.width;
            this.style.position = "fixed";
            this.detached = true;
        }
        const parentRect = this.parentElement.parentElement.getBoundingClientRect();
        const newPos = {
            X: e.clientX - this.startPos.X - parentRect.left,
            Y: e.clientY - this.startPos.Y - parentRect.top
        };
        this.style.left = newPos.X + "px";
        this.style.top = newPos.Y + "px";
        // Show where item will be dropped
        const elementsUnder = this.getRelatedElementsUnder();
        // If a draggable is under, and the placeholder wasn't already inserted there
        if (elementsUnder.closestDraggable != undefined) {
            const placeholder = this.parentElement.parentElement.querySelector(this.placeholder);
            const overTopHalf = elementsUnder.middlePoint.Y <= this.getMiddlePoint(elementsUnder.closestDraggable).Y;
            // If over the top half of the element
            if (overTopHalf && this.lastHoveredDraggable != elementsUnder.closestDraggable) {
                elementsUnder.taskList.insertBefore(placeholder, elementsUnder.closestDraggable);
                this.lastHoveredDraggable = elementsUnder.closestDraggable; // Remember last placement 
            }
            else if (this.lastHoveredDraggable != elementsUnder.closestDraggable.nextSibling) { // If over the bottom half of the element
                elementsUnder.taskList.insertBefore(placeholder, elementsUnder.closestDraggable.nextSibling);
                this.lastHoveredDraggable = elementsUnder.closestDraggable.nextSibling;
            }
        }
    }
    /**
     * Get <draggable> element under the element currently being dragged, and
     * also the hovered tasklist.
     */
    getRelatedElementsUnder() {
        const middlePoint = this.getMiddlePoint();
        const elementsOnPoint = document.elementsFromPoint(middlePoint.X, middlePoint.Y);
        const closestDraggable = elementsOnPoint.filter(x => x.tagName == "DRAGGABLE-ELEMENT")[1];
        const taskList = elementsOnPoint.filter(x => x.tagName == "TASKLIST")[0];
        return { closestDraggable, taskList, middlePoint };
    }
    /**
     * Get the global coordinates of the elements middle point.
     * @param   {element} element The element to get the middle point of
     */
    getMiddlePoint(element = this) {
        const rect = element.getBoundingClientRect();
        return {
            X: rect.width / 2 + rect.left,
            Y: rect.height / 2 + rect.top
        };
    }
};
Draggable = __decorate([
    lit_element_1.customElement('draggable-element')
], Draggable);
exports.Draggable = Draggable;
