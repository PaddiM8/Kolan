import { LitElement, html, customElement, property } from 'lit-element';

@customElement("text-input")
class TextInput extends LitElement {
   @property() placeholder = "";
   @property() type = "";

   render(){
      console.log("hi");
      return html`
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
      hi
      <input type="text" placeholder="${html`${this.placeholder}`} />"
    `;
   }
}
