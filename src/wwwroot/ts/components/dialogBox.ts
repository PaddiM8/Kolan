import { LitElement, html, css, property, customElement } from 'lit-element';

/**
 * Dialog element that takes a json input and outputs json.
 */
@customElement('dialog-box')
export class DialogBox extends LitElement {
   @property() inputs;
   @property({type: boolean}) shown;

   render() {
      return html`${inputs.map(x => 
         html`${x.value}<br /><input type="${x.inputType}" placeholder="${x.value}" /><br />`)}`;
   }

   update() {
      console.log(this.inputs);
   }
}
