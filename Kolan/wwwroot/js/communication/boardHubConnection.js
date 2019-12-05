"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signalR = require("@microsoft/signalr");
class BoardHubConnection {
    constructor(boardId) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .build();
        this.connection.on("receiveMessage", message => console.log(message));
        this.connection.invoke("join", boardId);
    }
}
exports.BoardHubConnection = BoardHubConnection;
