import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import "fa-icons";

@customElement("input-list")
export class InputList extends LitElement {
    @property({type: Array }) items = [];
    private inputPlaceholder: string;

    constructor(inputPlaceholder: string) {
        super();
        this.inputPlaceholder = inputPlaceholder;
    }

    render() {
        return html`
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
            <button @click="${(e) => this.addItem()}">Add</button>
        </section>
        <ul>
            ${this.items.map((item: string) => this.createItem(item))}
        </ul>
        `;
    }

    /**
     * Create the html for a list item
     * @param value Text that will appear on the item
     */
    private createItem(value: string): TemplateResult {
        return html`
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

    /**
     * Adds a new item to the list and fires an event.
     */
    private addItem(): void {
        const inputElement: HTMLInputElement = this.shadowRoot.getElementById("textInput") as HTMLInputElement;
        const value = inputElement.value;

        if (value.length == 0) return; // Don't add it if the input is empty

        this.items = [...this.items, value];
        inputElement.value = "";

        if (dispatchEvent) {
            this.dispatchEvent(new CustomEvent("itemAdded", {
                bubbles: true,  // Let the event be listened to from outside a web component, eg. dialog-box
                composed: true,
                detail: value
            }));
        }
    }

    private handleIconMouseOver(e): void {
        e.target.color = "red";
    }

    private handleIconMouseOut(e): void {
        e.target.color = "black";
    }

    private handleIconClick(e: Event): void {
        const itemElement = (e.target as HTMLElement).parentElement;
        const itemValue = itemElement.dataset.value;
        this.items = this.items.filter((item: string) => item != itemValue); // Remove from list, give back a list without the item. Needs optimization.

        this.dispatchEvent(new CustomEvent("itemRemoved", {
            bubbles: true,
            composed: true,
            detail: itemValue
        }));
    }
}
