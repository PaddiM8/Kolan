"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputType_1 = require("../enums/inputType");
/** Dialog template for adding board items
 */
exports.addBoardDialog = {
    title: "Add Board",
    primaryButton: "Add",
    inputs: [
        {
            key: "name",
            value: "Board name",
            inputType: inputType_1.InputType.Text
        },
        {
            key: "description",
            value: "Short description",
            inputType: inputType_1.InputType.Text
        }
    ]
};
