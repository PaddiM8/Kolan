!function(e){var t={};function s(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,s),i.l=!0,i.exports}s.m=e,s.c=t,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)s.d(n,i,function(t){return e[t]}.bind(null,i));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=0)}([function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),s(1)},function(e,t,s){"use strict";var n=this&&this.__decorate||function(e,t,s,n){var i,r=arguments.length,o=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,s):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,s,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(o=(r<3?i(o):r>3?i(t,s,o):i(t,s))||o);return r>3&&o&&Object.defineProperty(t,s,o),o};Object.defineProperty(t,"__esModule",{value:!0});const i=s(2);let r=class extends i.LitElement{constructor(){super(...arguments),this.placeholder="placeholder",this.mouseIsDown=!1,this.startPos={X:0,Y:0},this.detached=!1}static get styles(){return i.css`
      :host {
        display: block;
        -moz-user-select: none;
        user-select: none;
      }
    `}render(){return i.html`<slot></slot>`}firstUpdated(e){this.addEventListener("mousedown",e=>this.onMouseDown(e)),document.body.addEventListener("mouseup",()=>{this.detached&&this.onMouseUp(this)}),document.body.addEventListener("mousemove",e=>{this.mouseIsDown&&this.onMouseMove(e)})}onMouseDown(e){this.mouseIsDown=!0,this.startPos={X:e.clientX-this.getBoundingClientRect().left,Y:e.clientY-this.getBoundingClientRect().top}}onMouseUp(e){e.mouseIsDown=!1;const t=e.getRelatedElementsUnder();e.style.position="",e.style.width="";const s=e.parentElement.parentElement.querySelector(this.placeholder);t.taskList.insertBefore(e,s),s.style.display="none",e.detached=!1}onMouseMove(e){if(!this.detached){const e=getComputedStyle(this),t=this.parentElement.parentElement.querySelector(this.placeholder);this.parentElement.insertBefore(t,this),Object.assign(t.style,{width:e.width,height:e.height,display:"block"}),this.parentElement.parentElement.appendChild(this),this.style.width=e.width,this.style.position="fixed",this.detached=!0}const t=this.parentElement.parentElement.getBoundingClientRect(),s=e.clientX-this.startPos.X-t.left,n=e.clientY-this.startPos.Y-t.top;this.style.left=s+"px",this.style.top=n+"px";const i=this.getRelatedElementsUnder();if(null!=i.closestDraggable){const e=this.parentElement.parentElement.querySelector(this.placeholder);i.middlePoint.Y<=this.getMiddlePoint(i.closestDraggable).Y&&this.lastHoveredDraggable!=i.closestDraggable?(i.taskList.insertBefore(e,i.closestDraggable),this.lastHoveredDraggable=i.closestDraggable):this.lastHoveredDraggable!=i.closestDraggable.nextSibling&&(i.taskList.insertBefore(e,i.closestDraggable.nextSibling),this.lastHoveredDraggable=i.closestDraggable.nextSibling)}}getRelatedElementsUnder(){const e=this.getMiddlePoint(),t=document.elementsFromPoint(e.X,e.Y);return{closestDraggable:t.filter(e=>"DRAGGABLE-ELEMENT"==e.tagName)[1],taskList:t.filter(e=>"TASKLIST"==e.tagName)[0],middlePoint:e}}getMiddlePoint(e=this){const t=e.getBoundingClientRect();return{X:t.width/2+t.left,Y:t.height/2+t.top}}};r=n([i.customElement("draggable-element")],r),t.Draggable=r},function(e,t,s){"use strict";s.r(t);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const n=new WeakMap,i=e=>"function"==typeof e&&n.has(e),r=void 0!==window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,o=(e,t,s=null,n=null)=>{for(;t!==s;){const s=t.nextSibling;e.insertBefore(t,n),t=s}},a=(e,t,s=null)=>{for(;t!==s;){const s=t.nextSibling;e.removeChild(t),t=s}},l={},c={},d=`{{lit-${String(Math.random()).slice(2)}}}`,h=`\x3c!--${d}--\x3e`,u=new RegExp(`${d}|${h}`),p="$lit$";class m{constructor(e,t){this.parts=[],this.element=t;const s=[],n=[],i=document.createTreeWalker(t.content,133,null,!1);let r=0,o=-1,a=0;const{strings:l,values:{length:c}}=e;for(;a<c;){const e=i.nextNode();if(null!==e){if(o++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:s}=t;let n=0;for(let e=0;e<s;e++)f(t[e].name,p)&&n++;for(;n-- >0;){const t=l[a],s=y.exec(t)[2],n=s.toLowerCase()+p,i=e.getAttribute(n);e.removeAttribute(n);const r=i.split(u);this.parts.push({type:"attribute",index:o,name:s,strings:r}),a+=r.length-1}}"TEMPLATE"===e.tagName&&(n.push(e),i.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(d)>=0){const n=e.parentNode,i=t.split(u),r=i.length-1;for(let t=0;t<r;t++){let s,r=i[t];if(""===r)s=_();else{const e=y.exec(r);null!==e&&f(e[2],p)&&(r=r.slice(0,e.index)+e[1]+e[2].slice(0,-p.length)+e[3]),s=document.createTextNode(r)}n.insertBefore(s,e),this.parts.push({type:"node",index:++o})}""===i[r]?(n.insertBefore(_(),e),s.push(e)):e.data=i[r],a+=r}}else if(8===e.nodeType)if(e.data===d){const t=e.parentNode;null!==e.previousSibling&&o!==r||(o++,t.insertBefore(_(),e)),r=o,this.parts.push({type:"node",index:o}),null===e.nextSibling?e.data="":(s.push(e),o--),a++}else{let t=-1;for(;-1!==(t=e.data.indexOf(d,t+1));)this.parts.push({type:"node",index:-1}),a++}}else i.currentNode=n.pop()}for(const e of s)e.parentNode.removeChild(e)}}const f=(e,t)=>{const s=e.length-t.length;return s>=0&&e.slice(s)===t},g=e=>-1!==e.index,_=()=>document.createComment(""),y=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=\/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class S{constructor(e,t,s){this.__parts=[],this.template=e,this.processor=t,this.options=s}update(e){let t=0;for(const s of this.__parts)void 0!==s&&s.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=r?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],s=this.template.parts,n=document.createTreeWalker(e,133,null,!1);let i,o=0,a=0,l=n.nextNode();for(;o<s.length;)if(i=s[o],g(i)){for(;a<i.index;)a++,"TEMPLATE"===l.nodeName&&(t.push(l),n.currentNode=l.content),null===(l=n.nextNode())&&(n.currentNode=t.pop(),l=n.nextNode());if("node"===i.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(l.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,i.name,i.strings,this.options));o++}else this.__parts.push(void 0),o++;return r&&(document.adoptNode(e),customElements.upgrade(e)),e}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */class v{constructor(e,t,s,n){this.strings=e,this.values=t,this.type=s,this.processor=n}getHTML(){const e=this.strings.length-1;let t="",s=!1;for(let n=0;n<e;n++){const e=this.strings[n],i=e.lastIndexOf("\x3c!--");s=(i>-1||s)&&-1===e.indexOf("--\x3e",i+1);const r=y.exec(e);t+=null===r?e+(s?d:h):e.substr(0,r.index)+r[1]+r[2]+p+r[3]+d}return t+=this.strings[e]}getTemplateElement(){const e=document.createElement("template");return e.innerHTML=this.getHTML(),e}}class b extends v{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const e=super.getTemplateElement(),t=e.content,s=t.firstChild;return t.removeChild(s),o(t,s.firstChild),e}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const w=e=>null===e||!("object"==typeof e||"function"==typeof e),P=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class x{constructor(e,t,s){this.dirty=!0,this.element=e,this.name=t,this.strings=s,this.parts=[];for(let e=0;e<s.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new C(this)}_getValue(){const e=this.strings,t=e.length-1;let s="";for(let n=0;n<t;n++){s+=e[n];const t=this.parts[n];if(void 0!==t){const e=t.value;if(w(e)||!P(e))s+="string"==typeof e?e:String(e);else for(const t of e)s+="string"==typeof t?t:String(t)}}return s+=e[t]}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class C{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===l||w(e)&&e===this.value||(this.value=e,i(e)||(this.committer.dirty=!0))}commit(){for(;i(this.value);){const e=this.value;this.value=l,e(this)}this.value!==l&&this.committer.commit()}}class E{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(_()),this.endNode=e.appendChild(_())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=_()),e.__insert(this.endNode=_())}insertAfterPart(e){e.__insert(this.startNode=_()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){for(;i(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=l,e(this)}const e=this.__pendingValue;e!==l&&(w(e)?e!==this.value&&this.__commitText(e):e instanceof v?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):P(e)?this.__commitIterable(e):e===c?(this.value=c,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling;e=null==e?"":e,t===this.endNode.previousSibling&&3===t.nodeType?t.data=e:this.__commitNode(document.createTextNode("string"==typeof e?e:String(e))),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof S&&this.value.template===t)this.value.update(e.values);else{const s=new S(t,e.processor,this.options),n=s._clone();s.update(e.values),this.__commitNode(n),this.value=s}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let s,n=0;for(const i of e)void 0===(s=t[n])&&(s=new E(this.options),t.push(s),0===n?s.appendIntoPart(this):s.insertAfterPart(t[n-1])),s.setValue(i),s.commit(),n++;n<t.length&&(t.length=n,this.clear(s&&s.endNode))}clear(e=this.startNode){a(this.startNode.parentNode,e.nextSibling,this.endNode)}}class N{constructor(e,t,s){if(this.value=void 0,this.__pendingValue=void 0,2!==s.length||""!==s[0]||""!==s[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=s}setValue(e){this.__pendingValue=e}commit(){for(;i(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=l,e(this)}if(this.__pendingValue===l)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=l}}class T extends x{constructor(e,t,s){super(e,t,s),this.single=2===s.length&&""===s[0]&&""===s[1]}_createPart(){return new A(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class A extends C{}let O=!1;try{const e={get capture(){return O=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}class V{constructor(e,t,s){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=s,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;i(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=l,e(this)}if(this.__pendingValue===l)return;const e=this.__pendingValue,t=this.value,s=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),n=null!=e&&(null==t||s);s&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),n&&(this.__options=k(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=l}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const k=e=>e&&(O?{capture:e.capture,passive:e.passive,once:e.once}:e.capture);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const M=new class{handleAttributeExpressions(e,t,s,n){const i=t[0];return"."===i?new T(e,t.slice(1),s).parts:"@"===i?[new V(e,t.slice(1),n.eventContext)]:"?"===i?[new N(e,t.slice(1),s)]:new x(e,t,s).parts}handleTextExpression(e){return new E(e)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */function R(e){let t=j.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},j.set(e.type,t));let s=t.stringsArray.get(e.strings);if(void 0!==s)return s;const n=e.strings.join(d);return void 0===(s=t.keyString.get(n))&&(s=new m(e,e.getTemplateElement()),t.keyString.set(n,s)),t.stringsArray.set(e.strings,s),s}const j=new Map,U=new WeakMap;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.0.0");const D=(e,...t)=>new v(e,t,"html",M),L=(e,...t)=>new b(e,t,"svg",M),q=133;function z(e,t){const{element:{content:s},parts:n}=e,i=document.createTreeWalker(s,q,null,!1);let r=H(n),o=n[r],a=-1,l=0;const c=[];let d=null;for(;i.nextNode();){a++;const e=i.currentNode;for(e.previousSibling===d&&(d=null),t.has(e)&&(c.push(e),null===d&&(d=e)),null!==d&&l++;void 0!==o&&o.index===a;)o.index=null!==d?-1:o.index-l,o=n[r=H(n,r)]}c.forEach(e=>e.parentNode.removeChild(e))}const B=e=>{let t=11===e.nodeType?0:1;const s=document.createTreeWalker(e,q,null,!1);for(;s.nextNode();)t++;return t},H=(e,t=-1)=>{for(let s=t+1;s<e.length;s++){const t=e[s];if(g(t))return s}return-1};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const I=(e,t)=>`${e}--${t}`;let F=!0;void 0===window.ShadyCSS?F=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),F=!1);const $=e=>t=>{const s=I(t.type,e);let n=j.get(s);void 0===n&&(n={stringsArray:new WeakMap,keyString:new Map},j.set(s,n));let i=n.stringsArray.get(t.strings);if(void 0!==i)return i;const r=t.strings.join(d);if(void 0===(i=n.keyString.get(r))){const s=t.getTemplateElement();F&&window.ShadyCSS.prepareTemplateDom(s,e),i=new m(t,s),n.keyString.set(r,i)}return n.stringsArray.set(t.strings,i),i},W=["html","svg"],Y=new Set,J=(e,t,s)=>{Y.add(s);const n=e.querySelectorAll("style"),{length:i}=n;if(0===i)return void window.ShadyCSS.prepareTemplateStyles(t.element,s);const r=document.createElement("style");for(let e=0;e<i;e++){const t=n[e];t.parentNode.removeChild(t),r.textContent+=t.textContent}(e=>{W.forEach(t=>{const s=j.get(I(t,e));void 0!==s&&s.keyString.forEach(e=>{const{element:{content:t}}=e,s=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{s.add(e)}),z(e,s)})})})(s);const o=t.element.content;!function(e,t,s=null){const{element:{content:n},parts:i}=e;if(null==s)return void n.appendChild(t);const r=document.createTreeWalker(n,q,null,!1);let o=H(i),a=0,l=-1;for(;r.nextNode();)for(l++,r.currentNode===s&&(a=B(t),s.parentNode.insertBefore(t,s));-1!==o&&i[o].index===l;){if(a>0){for(;-1!==o;)i[o].index+=a,o=H(i,o);return}o=H(i,o)}}(t,r,o.firstChild),window.ShadyCSS.prepareTemplateStyles(t.element,s);const a=o.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==a)e.insertBefore(a.cloneNode(!0),e.firstChild);else{o.insertBefore(r,o.firstChild);const e=new Set;e.add(r),z(t,e)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
window.JSCompiler_renameProperty=(e,t)=>e;const X={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},G=(e,t)=>t!==e&&(t==t||e==e),K={attribute:!0,type:String,converter:X,reflect:!1,hasChanged:G},Q=Promise.resolve(!0),Z=1,ee=4,te=8,se=16,ne=32;class ie extends HTMLElement{constructor(){super(),this._updateState=0,this._instanceProperties=void 0,this._updatePromise=Q,this._hasConnectedResolver=void 0,this._changedProperties=new Map,this._reflectingProperties=void 0,this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,s)=>{const n=this._attributeNameForProperty(s,t);void 0!==n&&(this._attributeToPropertyMap.set(n,s),e.push(n))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=K){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const s="symbol"==typeof e?Symbol():`__${e}`;Object.defineProperty(this.prototype,e,{get(){return this[s]},set(t){const n=this[e];this[s]=t,this._requestUpdate(e,n)},configurable:!0,enumerable:!0})}static finalize(){if(this.hasOwnProperty(JSCompiler_renameProperty("finalized",this))&&this.finalized)return;const e=Object.getPrototypeOf(this);if("function"==typeof e.finalize&&e.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const s of t)this.createProperty(s,e[s])}}static _attributeNameForProperty(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,s=G){return s(e,t)}static _propertyValueFromAttribute(e,t){const s=t.type,n=t.converter||X,i="function"==typeof n?n:n.fromAttribute;return i?i(e,s):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const s=t.type,n=t.converter;return(n&&n.toAttribute||X.toAttribute)(e,s)}initialize(){this._saveInstanceProperties(),this._requestUpdate()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this._updateState=this._updateState|ne,this._hasConnectedResolver&&(this._hasConnectedResolver(),this._hasConnectedResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,s){t!==s&&this._attributeToProperty(e,s)}_propertyToAttribute(e,t,s=K){const n=this.constructor,i=n._attributeNameForProperty(e,s);if(void 0!==i){const e=n._propertyValueToAttribute(t,s);if(void 0===e)return;this._updateState=this._updateState|te,null==e?this.removeAttribute(i):this.setAttribute(i,e),this._updateState=this._updateState&~te}}_attributeToProperty(e,t){if(this._updateState&te)return;const s=this.constructor,n=s._attributeToPropertyMap.get(e);if(void 0!==n){const e=s._classProperties.get(n)||K;this._updateState=this._updateState|se,this[n]=s._propertyValueFromAttribute(t,e),this._updateState=this._updateState&~se}}_requestUpdate(e,t){let s=!0;if(void 0!==e){const n=this.constructor,i=n._classProperties.get(e)||K;n._valueHasChanged(this[e],t,i.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==i.reflect||this._updateState&se||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,i))):s=!1}!this._hasRequestedUpdate&&s&&this._enqueueUpdate()}requestUpdate(e,t){return this._requestUpdate(e,t),this.updateComplete}async _enqueueUpdate(){let e,t;this._updateState=this._updateState|ee;const s=this._updatePromise;this._updatePromise=new Promise((s,n)=>{e=s,t=n});try{await s}catch(e){}this._hasConnected||await new Promise(e=>this._hasConnectedResolver=e);try{const e=this.performUpdate();null!=e&&await e}catch(e){t(e)}e(!this._hasRequestedUpdate)}get _hasConnected(){return this._updateState&ne}get _hasRequestedUpdate(){return this._updateState&ee}get hasUpdated(){return this._updateState&Z}performUpdate(){this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{(e=this.shouldUpdate(t))&&this.update(t)}catch(t){throw e=!1,t}finally{this._markUpdated()}e&&(this._updateState&Z||(this._updateState=this._updateState|Z,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=this._updateState&~ee}get updateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0)}updated(e){}firstUpdated(e){}}ie.finalized=!0;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const re=e=>t=>"function"==typeof t?((e,t)=>(window.customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:s,elements:n}=t;return{kind:s,elements:n,finisher(t){window.customElements.define(e,t)}}})(e,t),oe=(e,t)=>"method"!==t.kind||!t.descriptor||"value"in t.descriptor?{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(s){s.createProperty(t.key,e)}}:Object.assign({},t,{finisher(s){s.createProperty(t.key,e)}}),ae=(e,t,s)=>{t.constructor.createProperty(s,e)};function le(e){return(t,s)=>void 0!==s?ae(e,t,s):oe(e,t)}function ce(e){return(t,s)=>{const n={get(){return this.renderRoot.querySelector(e)},enumerable:!0,configurable:!0};return void 0!==s?he(n,t,s):ue(n,t)}}function de(e){return(t,s)=>{const n={get(){return this.renderRoot.querySelectorAll(e)},enumerable:!0,configurable:!0};return void 0!==s?he(n,t,s):ue(n,t)}}const he=(e,t,s)=>{Object.defineProperty(t,s,e)},ue=(e,t)=>({kind:"method",placement:"prototype",key:t.key,descriptor:e}),pe=e=>(t,s)=>void 0!==s?((e,t,s)=>{Object.assign(t[s],e)})(e,t,s):((e,t)=>Object.assign({},t,{finisher(s){Object.assign(s.prototype[t.key],e)}}))(e,t),me="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,fe=Symbol();class ge{constructor(e,t){if(t!==fe)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&(me?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const _e=e=>new ge(String(e),fe),ye=(e,...t)=>{const s=t.reduce((t,s,n)=>t+(e=>{if(e instanceof ge)return e.cssText;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(s)+e[n+1],e[0]);return new ge(s,fe)};s.d(t,"LitElement",function(){return ve}),s.d(t,"defaultConverter",function(){return X}),s.d(t,"notEqual",function(){return G}),s.d(t,"UpdatingElement",function(){return ie}),s.d(t,"customElement",function(){return re}),s.d(t,"property",function(){return le}),s.d(t,"query",function(){return ce}),s.d(t,"queryAll",function(){return de}),s.d(t,"eventOptions",function(){return pe}),s.d(t,"html",function(){return D}),s.d(t,"svg",function(){return L}),s.d(t,"TemplateResult",function(){return v}),s.d(t,"SVGTemplateResult",function(){return b}),s.d(t,"supportsAdoptingStyleSheets",function(){return me}),s.d(t,"CSSResult",function(){return ge}),s.d(t,"unsafeCSS",function(){return _e}),s.d(t,"css",function(){return ye}),
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litElementVersions||(window.litElementVersions=[])).push("2.0.1");const Se=e=>e.flat?e.flat(1/0):function e(t,s=[]){for(let n=0,i=t.length;n<i;n++){const i=t[n];Array.isArray(i)?e(i,s):s.push(i)}return s}(e);class ve extends ie{static finalize(){super.finalize(),this._styles=this.hasOwnProperty(JSCompiler_renameProperty("styles",this))?this._getUniqueStyles():this._styles||[]}static _getUniqueStyles(){const e=this.styles,t=[];if(Array.isArray(e)){Se(e).reduceRight((e,t)=>(e.add(t),e),new Set).forEach(e=>t.unshift(e))}else e&&t.push(e);return t}initialize(){super.initialize(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?me?this.renderRoot.adoptedStyleSheets=e.map(e=>e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){super.update(e);const t=this.render();t instanceof v&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){}}ve.finalized=!0,ve.render=(e,t,s)=>{const n=s.scopeName,i=U.has(t),r=F&&11===t.nodeType&&!!t.host&&e instanceof v,o=r&&!Y.has(n),l=o?document.createDocumentFragment():t;if(((e,t,s)=>{let n=U.get(t);void 0===n&&(a(t,t.firstChild),U.set(t,n=new E(Object.assign({templateFactory:R},s))),n.appendInto(t)),n.setValue(e),n.commit()})(e,l,Object.assign({templateFactory:$(n)},s)),o){const e=U.get(l);U.delete(l),e.value instanceof S&&J(l,e.value.template,n),a(t,t.firstChild),t.appendChild(l),U.set(t,e)}!i&&r&&window.ShadyCSS.styleElement(t.host)}}]);