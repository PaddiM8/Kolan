"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputType_1 = require("../enums/inputType");
/** add board dialog schematic
 */
exports.addBoardDialog = {
    requestAction: "Boards",
    requestMethod: "",
    requestType: "POST",
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
