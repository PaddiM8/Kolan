"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputType_1 = require("../enums/inputType");
/** Share dialog schematic
 */
exports.shareDialog = {
    requestAction: "",
    requestMethod: "",
    requestType: "",
    title: "Add collaborators",
    primaryButton: "Done",
    inputs: [
        {
            key: "inputList",
            value: "Name of user",
            inputType: inputType_1.InputType.InputList
        }
    ]
};
