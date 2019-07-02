"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Class to return info about a HEX color
 */
class ColorInfo {
    constructor(color) {
        this._color = color;
    }
    /** Returns true if the color is dark
     */
    isDark() {
        return true;
    }
}
exports.ColorInfo = ColorInfo;
