import { LitElement, html, css, property, customElement } from 'lit-element';

@customElement('draggable-element')
export class Draggable extends LitElement {
  private placeholder = "placeholder";
  private mouseIsDown = false;
  private startPos = {X: 0, Y: 0};
  private detached = false;
  private lastHoveredDraggable;

  static get styles() {
    return css`
      :host {
        display: block;
        -moz-user-select: none;
        user-select: none;
      }
    `;
  }

  render() {
    return html`<slot></slot>`;
  }

  firstUpdated(changedProperties) {
    this.addEventListener('mousedown', e => this.onMouseDown(e));
    document.body.addEventListener('mouseup', () => {
      if (this.detached) this.onMouseUp(this);
    });
    document.body.addEventListener('mousemove', e => {
      if (this.mouseIsDown) this.onMouseMove(e);
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

    // Move placeholder
    const placeholder: HTMLElement = element.parentElement.parentElement.querySelector(this.placeholder);
    elementsUnder.taskList.insertBefore(element, placeholder);
    placeholder.style.display = "none";
    element.detached = false;
  }

  onMouseMove(e) {
    // Detach from list
    if (!this.detached) {
      const computedStyle = getComputedStyle(this);
      // Placeholder
      const placeholder: HTMLElement = this.parentElement.parentElement.querySelector(this.placeholder);
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

    const newPos = {
      X: e.clientX - this.startPos.X,
      Y: e.clientY - this.startPos.Y
    }

    this.style.left = newPos.X + "px";
    this.style.top = newPos.Y + "px";

    // Show where item will be dropped
    const elementsUnder = this.getRelatedElementsUnder();

    // If a draggable is under, and the placeholder wasn't already inserted there
    if (elementsUnder.closestDraggable != undefined) {
      const placeholder: HTMLElement = this.parentElement.parentElement.querySelector(this.placeholder);
      const overTopHalf = elementsUnder.middlePoint.Y <= this.getMiddlePoint(elementsUnder.closestDraggable).Y;

      // If over the top half of the element
      if  (overTopHalf && this.lastHoveredDraggable != elementsUnder.closestDraggable) {
        elementsUnder.taskList.insertBefore(placeholder, elementsUnder.closestDraggable);
        this.lastHoveredDraggable = elementsUnder.closestDraggable; // Remember last placement 
      } else if (this.lastHoveredDraggable != elementsUnder.closestDraggable.nextSibling) { // If over the bottom half of the element
        elementsUnder.taskList.insertBefore(placeholder, elementsUnder.closestDraggable.nextSibling);
        this.lastHoveredDraggable = elementsUnder.closestDraggable.nextSibling;
      }
    }
  }

  private getRelatedElementsUnder() {
    const middlePoint = this.getMiddlePoint();
    const elementsOnPoint = document.elementsFromPoint(middlePoint.X, middlePoint.Y);
    const closestDraggable = elementsOnPoint.filter(x => x.tagName == "DRAGGABLE-ELEMENT")[1];
    const taskList = elementsOnPoint.filter(x => x.tagName == "TASKLIST")[0];

    return { closestDraggable, taskList, middlePoint };
  }

  private getMiddlePoint(element: Element = this) {
    const rect = element.getBoundingClientRect();
    return {
      X: rect.width / 2 + rect.left,
      Y: rect.height / 2 + rect.top
    };
  }
}
