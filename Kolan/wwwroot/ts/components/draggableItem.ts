import { LitElement, html, css, property, customElement } from 'lit-element';

/**
 * Lit-element that can be dragged and dropped. needs a <tasklist> parent and a <section> grandparent.
 * Place a <placeholder> element inside the section and style it as you wish.
 *
 * @name customElement
 * @function
 */
@customElement('draggable-item')
export class DraggableItem extends LitElement {
    @property() movable = true;
    private placeholder = "placeholder";
    private mouseIsDown = false;
    private startPos = {X: 0, Y: 0};
    private mouseDownPos = {X: 0, Y: 0};
    private detached = false;
    private lastHoveredDraggable: DraggableItem;
    private currentTasklist: HTMLElement;
    private currentIndex: number;

    static get styles() {
        return css`
      :host {
        display: block;
        box-sizing: border-box;
      }
    `;
    }

    render() {
        return html`<slot></slot>`;
    }

    firstUpdated(changedProperties) {
        let dragger = this.querySelector(".dragger");
        if (dragger == undefined) dragger = this;
        else dragger.addEventListener("click", () => this.mouseIsDown = false); // Otherwise it won't let go when you click

        dragger.addEventListener('mousedown', e => {
            if (e.target == dragger) this.onMouseDown(e); // Makes sure it isn't a child that was clicked.
        });

        this.addEventListener('click', e => this.onClick(e));
        document.body.addEventListener('mouseup', (e) => {
            if (this.detached) this.onMouseUp(this, e);
        });
        document.body.addEventListener('mousemove', e => {
            if (this.mouseIsDown) this.onMouseMove(e);
        });
        this.addEventListener("mousedown", e => { // Save mouse coordinates when mouse down anywhere on element
            this.mouseDownPos = {
                X: e.pageX,
                Y: e.pageY
            };
        });
    }

    private onMouseDown(e): void {
        this.mouseIsDown = true && this.movable;
        const rect = this.getBoundingClientRect();

        this.startPos = {
            X: Math.floor(e.clientX - rect.left),
            Y: Math.floor(e.clientY - rect.top),
        };

        this.currentTasklist = this.parentElement;
        this.currentIndex = this.getArrayItemIndex(this.parentElement.children, this);
        e.target.style.userSelect = "none";
    }

    private onClick(e): void {
        this.mouseIsDown = false;
        if (e.target != this && e.target.parentElement != this) // Ignore if it's a grand-child
            return;

        // If mouse is at same position as before, it's just a click.
        // Fire the "draggableClick" event, since a normal click event also fires
        // even when the element has been dragged.
        if (this.mouseDownPos.X == e.pageX &&
            this.mouseDownPos.Y == e.pageY) {
            this.dispatchEvent(new CustomEvent("draggableClick", {
                detail: {
                    childClicked: e.target != this,
                    target: e.target
                }
            }));
        }
    }

    private onMouseUp(element: DraggableItem, e): void {
        element.mouseIsDown = false;

        // Attach element
        element.style.position = "";
        element.style.width = "";
        element.style.userSelect = "";
        element.style.top = "";
        element.style.left = "";
        element.style.zIndex = "";
        e.target.style.userSelect = "";

        // Move to placeholder
        const placeholder: HTMLElement = this.currentTasklist.parentElement.querySelector(this.placeholder);
        const targetTasklist = placeholder.parentElement;
        const targetIndex = this.getArrayItemIndex(placeholder.parentElement.children, placeholder);

        placeholder.parentElement.insertBefore(element, placeholder);
        placeholder.style.display = "none";
        element.detached = false;

        if (this.currentTasklist != targetTasklist) { // If moved to another tasklist
            this.dispatchEvent(new CustomEvent("taskExternalMove", {
                "detail": {
                    fromTasklist: this.currentTasklist,
                    toTasklist: targetTasklist,
                    toIndex: targetIndex,
                    toItem: this.previousElementSibling
                }
            }));
        } else if (this.currentIndex != targetIndex) { // If moved within the same tasklist.
            this.dispatchEvent(new CustomEvent("taskInternalMove", {
                "detail": {
                    fromIndex: this.currentIndex,
                    toIndex: targetIndex,
                    toItem: this.previousElementSibling
                }
            }));
        }
    }

    private onMouseMove(e): void {
        if (e.buttons != 1) return; // If left-click mouse button is not being held down, return

        // Detach from list
        if (!this.detached) {
            // Placeholder
            const placeholder: HTMLElement = this.parentElement.parentElement.querySelector(this.placeholder);
            placeholder.style.boxSizing = "border-box";

            this.parentElement.insertBefore(placeholder, this); // Move placeholder to list slot
            Object.assign(placeholder.style, {
                height: this.offsetHeight + "px",
                display: "block"
            });

            // Draggable
            this.style.width = this.offsetWidth + "px";
            this.style.position = "absolute";
            this.classList.toggle("dragged");
            this.ownerDocument.body.appendChild(this); // Move task out from tasklists, then get position: absolute
            this.detached = true;
            this.style.zIndex = "150";
        }

        const newPos = {
            X: e.pageX - this.startPos.X,
            Y: e.pageY - this.startPos.Y
        }

        this.style.left = newPos.X + "px";
        this.style.top = newPos.Y + "px";

        // Show where item will be dropped
        const elementsUnder = this.getRelatedElementsUnder();
        if (!elementsUnder.tasklist) return;
        const placeholder: HTMLElement = this.parentElement.parentElement.querySelector(this.placeholder);
        const tasklistElements = elementsUnder.tasklist.children;
        let lastRect = undefined;

        if (tasklistElements.length > 0 )
        {
            lastRect = tasklistElements[tasklistElements.length - 1].getBoundingClientRect(); // Get last element in tasklist if not empty
        }

        if (!elementsUnder.tasklist) return;

        // If a draggable is under, and the placeholder wasn't already inserted there
        const closest = elementsUnder.closestDraggable;
        if (closest && closest != this) {
            const overTopHalf = elementsUnder.middlePoint.Y <= this.getMiddlePoint(closest).Y;

            // If over the top half of the element
            if  (overTopHalf && this.lastHoveredDraggable != closest) {
                elementsUnder.tasklist.insertBefore(placeholder, closest);
                this.lastHoveredDraggable = closest as DraggableItem; // Remember last placement
            } else if (this.lastHoveredDraggable != closest.nextSibling) { // If over the bottom half of the element
                elementsUnder.tasklist.insertBefore(placeholder, closest.nextSibling);
                this.lastHoveredDraggable = closest.nextSibling as DraggableItem;
            }
        } else if (!lastRect) { // If empty tasklist
            elementsUnder.tasklist.appendChild(placeholder);
        } else if (this.getMiddlePoint().Y > lastRect.top + lastRect.height) {  // If at bottom
            elementsUnder.tasklist.appendChild(placeholder);
        }
    }

    /**
     * Get draggable element under the element currently being dragged, and also the hovered tasklist.
     *
     * @name getRelatedElementsUnder
     * @function
     * @returns {undefined}
     */
    private getRelatedElementsUnder() {
        const middlePoint = this.getMiddlePoint();
        const elementsOnPoint = document.elementsFromPoint(middlePoint.X, middlePoint.Y);
        let   closestDraggable = elementsOnPoint.filter(x => x.tagName == "DRAGGABLE-ITEM")[1];
        const tasklist = elementsOnPoint.filter(x => x.classList.contains("draggableContainer"))[0];

        if (tasklist && !closestDraggable) {
            const under = document.elementsFromPoint(middlePoint.X, middlePoint.Y + 40)
                .filter(x => x.tagName == "DRAGGABLE-ITEM");

            if (under[1] == undefined) closestDraggable = under[0];
            else closestDraggable = under[1];
        }

        return { closestDraggable, tasklist, middlePoint };
    }

    /**
     * Get the global coordinates of the element's middle point.
     *
     * @name getMiddlePoint
     * @function
     * @param {Element} element=this
     * @returns {undefined}
     */
    private getMiddlePoint(element: Element = this) {
        const rect = element.getBoundingClientRect();
        return {
            X: rect.width / 2 + rect.left,
            Y: rect.height / 2 + rect.top
        };
    }

    /**
     * Get the index of a specific item in an array
     *
     * @name getArrayItemIndex
     * @function
     * @param array
     * @param item
     * @returns {number}
     */
    private getArrayItemIndex(array, item): number {
        return Array.from(array).indexOf(item);
    }
}
