"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputType_1 = require("../enums/inputType");
/** add task dialog schematic
 */
exports.addTaskDialog = {
    requestAction: "Boards",
    requestMethod: "",
    requestType: "POST",
    title: "Add Task",
    primaryButton: "Add",
    inputs: [
        {
            key: "name",
            value: "Task title",
            inputType: inputType_1.InputType.Text
        },
        {
            key: "description",
            value: "Task description",
            inputType: inputType_1.InputType.Text
        }
    ]
};
