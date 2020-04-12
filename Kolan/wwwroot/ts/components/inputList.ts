import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import { FaIcon } from "fa-icons";
import { ThemeManager } from "../themes/themeManager";

@customElement("input-list")
export class InputList extends LitElement {
    @property({ type: Array }) items = [];
    @property({ type: Boolean }) draggableItems;
    private inputPlaceholder: string;
    private grabbedItem: HTMLElement;
    private listElement: HTMLElement;
    private placeholderElement: HTMLElement;
    private rect;
    private mouseOffsetY;
    private lastRemoved;

    constructor(inputPlaceholder: string, draggableItems = false) {
        super();
        this.inputPlaceholder = inputPlaceholder;
        this.draggableItems = draggableItems;
        this.addEventListener("mouseup", e => this.onMouseUp(e));
        this.addEventListener("mousemove", e => this.onMouseMove(e));
    }

    render() {
        return html`
        <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
        <link rel="stylesheet" type="text/css" href="../css/themes/${ThemeManager.getTheme()}.css">
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

            ul {
                position: relative;
                width: 100%;
                height: 225px;
                border: 1px solid #9e9e9e;
                list-style: none;
                margin-left: 0;
                padding-left: 0;
                overflow: auto;
            }

            li, placeholder {
                padding: 15px;
                border-top: 1px solid #9e9e9e;
                border-bottom: 1px solid #9e9e9e;
                margin-top: -1px;
                background-color: white;
                box-sizing: border-box;
            }

            #placeholder {
                padding-top: 25px;
                padding-bottom: 25px;
                background-color: #eeeeee;
            }

            li {
                display: flex;
                flex-direction: row;
                align-items: center;
            }

            li span {
                vertical-align: middle;
            }

            .icon {
                font-size: 21px;
            }

            .delete {
                cursor: pointer;
                margin-left: auto;
                margin-bottom: -3px;
            }

            .delete:hover {
                color: red;
            }

            .dragger {
                cursor: grabbing;
                margin-right: 10px;
                margin-bottom: -3px;
            }
        </style>
        <section class="inputBlock">
            <input id="textInput" type="text" placeholder="${this.inputPlaceholder}" />
            <button @click="${(e) => this.addItem()}">Add</button>
        </section>
        <ul id="list">
            ${this.items.map((item) => this.createItem(item.name))}
        </ul>
        `;
    }

    /**
     * Create the HTML for a list item.
     */
    private createItem(value: string): TemplateResult {
        const li = document.createElement("li");
        li.dataset.value = value;

        const dragger = document.createElement("span") as FaIcon;
        dragger.className = "icon icon-bars dragger";
        dragger.addEventListener("mousedown", e => this.onItemMouseDown(e));

        const span = document.createElement("span");
        span.className = "itemValue";
        span.textContent = value;

        const deleteButton = document.createElement("span") as FaIcon;
        deleteButton.className = "icon icon-times delete";
        deleteButton.addEventListener("click", (e) => this.onRemoveClick(e));

        if (this.draggableItems) li.appendChild(dragger);
        li.appendChild(span);
        li.appendChild(deleteButton);

        return html`${li}`;
    }

    /**
     * Add a new item to the list and fire an event.
     */
    private addItem(): void {
        const inputElement: HTMLInputElement = this.shadowRoot.getElementById("textInput") as HTMLInputElement;
        const value = inputElement.value;

        if (value.length == 0) return; // Don't add it if the input is empty

        this.items = [...this.items, { name: value }];
        inputElement.value = "";

        if (dispatchEvent) {
            this.dispatchEvent(new CustomEvent("itemAdded", {
                bubbles: true,  // Let the event be listened to from outside a web component, eg. dialog-box
                composed: true,
                detail: {
                    value: value,
                    object: this
                }
            }));
        }
    }

    /**
    * Remove the last added item
    */
    public undoAdd(): void {
        const lastItem = this.items[this.items.length - 1];
        this.items = this.items.filter((item: string) => item != lastItem);
    }

    /**
    * Re-add the last removed item
    */
    public undoRemove(): void {
        this.items.splice(this.lastRemoved.index, 0, this.lastRemoved.item);
    }

    private onRemoveClick(e: Event): void {
        const itemElement = (e.target as HTMLElement).parentElement;
        const itemValue = itemElement.dataset.value;
        const index = this.items.findIndex((value) => value.name == itemValue);
        const item = this.items[index];

        this.lastRemoved = { index: index, item: item };
        this.items = this.items.filter((item) => item.name != itemValue); // Remove from list, give back a list without the item. Needs optimization.

        this.dispatchEvent(new CustomEvent("itemRemoved", {
            bubbles: true,
            composed: true,
            detail: {
                item: item,
                index: index,
                object: this
            }
        }));
    }

    private onItemMouseDown(e): void {
        const item = e.target.parentElement;
        const index = [...item.parentNode.children].indexOf(item);
        item.dataset.mouseDown = "true";
        item.dataset.lastIndex = index;
        item.style.width = item.getBoundingClientRect().width + "px";
        item.style.position = "absolute";
        item.style.userSelect = "none";
        item.style.borderBottom = "1px solid #9e9e9e";

        this.grabbedItem = item;
        this.listElement = this.shadowRoot.getElementById("list");
        this.rect = this.listElement.getBoundingClientRect();
        this.mouseOffsetY = e.clientY - item.getBoundingClientRect().top;

        // Create placeholder if it doesn't exist already
        if (!this.placeholderElement) {
            this.placeholderElement = document.createElement("li")
            this.placeholderElement.id = "placeholder";
        }

        this.placeholderElement.style.display = ""; // Reset display style since it might have been changed in the onMouseUp function
    }

    private onMouseUp(e): void {
        if (!this.grabbedItem) return;
        if (this.grabbedItem.dataset.mouseDown != "true") return;

        this.grabbedItem.dataset.mouseDown = "false";
        this.grabbedItem.style.width = "";
        this.grabbedItem.style.position = "";
        this.grabbedItem.style.userSelect = "";
        this.grabbedItem.style.borderBottom = "";

        this.listElement.insertBefore(this.grabbedItem, this.placeholderElement);
        this.placeholderElement.style.display = "none";

        const fromIndex = parseInt(this.grabbedItem.dataset.lastIndex);
        const toIndex = Array.from(this.grabbedItem.parentNode.children).indexOf(this.grabbedItem);
        this.moveArrayItem(this.items, fromIndex, toIndex);

        this.grabbedItem.dataset.lastIndex = "";
        this.grabbedItem = undefined;

        this.dispatchEvent(new CustomEvent("itemMoved", {
            bubbles: true,
            composed: true,
            detail: {
                fromIndex: fromIndex,
                toIndex: toIndex
            }
        }));
    }

    private onMouseMove(e): void {
        if (!this.grabbedItem) return;
        if (this.grabbedItem.dataset.mouseDown == "false" &&
            !this.grabbedItem.dataset.mouseDown) return;

        const localMouseY = e.clientY - this.rect.top + this.listElement.scrollTop;
        this.grabbedItem.style.top = localMouseY - this.mouseOffsetY + "px";

        const elementsUnder = this.shadowRoot.elementsFromPoint(e.clientX, e.clientY);
        const nearestItem = elementsUnder.find(x =>
            x.tagName == "LI" && 
            x != this.grabbedItem &&
            x.id != "placeholder");

        if (!nearestItem) return;

        const nearestItemRect = nearestItem.getBoundingClientRect();
        const nearestItemLocalMouseY = e.clientY - nearestItemRect.top + this.listElement.scrollTop;

        // If mouse is on lower half of the element
        if (nearestItemLocalMouseY > nearestItemRect.height / 2) {
            this.listElement.insertBefore(this.placeholderElement, nearestItem.nextSibling); // Insert after
        } else {
            this.listElement.insertBefore(this.placeholderElement, nearestItem);
        }
    }

    /**
    * Move an array item from one index to another and return the new array
    */
    private moveArrayItem(arr, fromIndex, toIndex) {
        arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);

        return arr;
    };
}
