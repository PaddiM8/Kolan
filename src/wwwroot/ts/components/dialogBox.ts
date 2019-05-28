import { LitElement, html, css, property, customElement } from 'lit-element';

/**
 * Dialog element that takes a json input and outputs json.
 */
@customElement('dialog-box')
export class DialogBox extends LitElement {
   @property() inputs;

   render() {
      return html``;
   }

   update() {
      console.log(this.inputs);
   }
}
