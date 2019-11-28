import { LitElement, html, customElement, property } from 'lit-element';

@customElement("input-list")
export class InputList extends LitElement {
    @property({type: Array<String>()}) items;

    render() {
        this.items = [ "Testing", "Hhuehueehu" ];
        return html`
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
            ${this.items.map((item) => html`
                <li>${item}</li>
            `)}
        </ul>
        `;
    }
}
