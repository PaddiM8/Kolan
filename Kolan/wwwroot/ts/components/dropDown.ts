import { LitElement, html, css, property, customElement } from "lit-element";
import { ThemeManager } from "../themes/themeManager";

@customElement("drop-down")
export class DropDown extends LitElement {
    @property({type: String}) value;
    @property({type: Array<string>()}) items = [];
    @property({type: Number}) selectedIndex;

    static get styles() {
        return css `
        :host {
            display: inline-block;
        }

        .select {
            position: relative;
            display: inline-block;
            margin-bottom: 15px;
            width: 100%;
        }

        .select select {
            display: inline-block;
            width: 100%;
            padding: 10px 15px;

            outline: 0;
            border: 0px solid #000000;
            border-radius: 0px;
            background: #e6e6e6;

            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            cursor: pointer;
        }

        .select select:hover, .select select:focus {
            color: #000000;
            background: #cccccc;
        }

        .select select:disabled {
            opacity: 0.5;
            pointer-events: none;
        }

        .arrow {
            position: absolute;
            top: 16px;
            right: 15px;
            pointer-events: none;
            border-style: solid;
            border-width: 8px 5px 0px 5px;
            border-color: #424242 transparent transparent transparent;
        }

        .select select:hover ~ .arrow, .select select:focus ~ .arrow {
            border-top-color: #000000;
        }

        .select select:disabled ~ .arrow {
            border-top-color: #cccccc;
        }
        `;
    }

    render() {
        return html`
        <div class="select">
            <select @change="${this.onChange}">
                <slot></slot>
                ${this.items.map(x => html`<option value="${x}">${x}</option>`)}
            </select>
            <div class="arrow"></div>
        </div>
        `;
    }

    updated() {
        this.shadowRoot.querySelector("select").value = this.value;
    }

    private onChange(e): void {
        this.selectedIndex = e.target.selectedIndex;
        this.value = this.items[e.target.selectedIndex];
        this.dispatchEvent(new CustomEvent("change", { detail: e }));
    }
}
