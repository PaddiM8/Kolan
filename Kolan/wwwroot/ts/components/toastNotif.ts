import { LitElement, html, css, property, customElement } from "lit-element";
import { ToastType } from "../enums/toastType";
import { ThemeManager } from "../themes/themeManager";
import "fa-icons";

@customElement("toast-notif")
export class ToastNotif extends LitElement {
    @property({ type: String }) message;
    @property({ type: ToastType }) type;
    @property({ type: Boolean }) persistent;

    constructor(message: string, type: ToastType, persistent: Boolean = false) {
        super();
        this.message = message;
        this.type = type;
        this.persistent = persistent;
    }

    render() {
        // The :host style block needs to be applied immediately.
        return html`
        <style>
        :host {
            position: absolute;
            min-width: 300px;
            font-family: "Inter", sans-serif;
            top: 0;

            margin-left: 50%;
            transform: translateX(-50%);
            transition: 1s ease all;
            z-index: 999999;
        }
        </style>
        <link rel="stylesheet" type="text/css" href="../css/components/toastNotif.${ThemeManager.getTheme()}.css">
        <div id="content" class="toast ${this.type}" @click="${this.onClick}">
            <span class="icon icon-${this.getIconName()}"></span>
            <span>${this.message}</span>
        </div>
        `;
    }

    firstUpdated(_) {
        setTimeout(() => {
            this.shadowRoot.getElementById("content").classList.add("slide-down");
        }, 100);

        if (!this.persistent) setTimeout(() => {
            this.hide()
        }, 2500);
    }

    /**
    * Hide the toast
    */
    public hide(): void {
        this.shadowRoot.getElementById("content").classList.toggle("slide-down");
        setTimeout(() => {
            this.parentNode.removeChild(this);
        }, 300);
    }

    /**
    * Get the class name used for the icon corresponding to the toast type.
    */
    private getIconName(): string {
        switch (this.type) {
            case ToastType.Info:    return "info";
            case ToastType.Warning: return "warning";
            case ToastType.Error:   return "error";
        }
    }

    private onClick(): void {
        this.hide();
    }
}
