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

    static get styles() {
        return css `
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

            :host > div {
                width: 100%;
                height: 100%;
                padding: 15px;
                transform: translateY(-80px);
                border-radius: 8px;
                color: white;
                transition: .2s ease all;
            }

            div.slide-down {
                transform: translateY(10px);
            }

            fa-icon {
                display: inline-block;
                margin-left: 5px;
                margin-right: 10px;
                float: left;
            }

            span {
                display: inline-block;
            }

            .info {
                background-color: #424242;
            }

            .warning {
                background-color: #F9A825;
            }

            .error {
                background-color: #E53935;
            }
        `;
    }

    render() {
        return html`
        <link rel="stylesheet" type="text/css" href="../css/themes/${ThemeManager.getTheme()}.css">
        <div id="content" class="toast ${this.type}" @click="${this.onClick}">
            <fa-icon class="fas fa-${this.getIconName()}" size="18px" color="#fff" path-prefix="/node_modules"></fa-icon>
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
            case ToastType.Warning: return "exclamation-triangle";
            case ToastType.Error:   return "exclamation-circle";
        }
    }

    private onClick(): void {
        this.hide();
    }
}
