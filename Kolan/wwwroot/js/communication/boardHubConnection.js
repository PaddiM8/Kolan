"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signalR = require("@microsoft/signalr");
class BoardHubConnection {
    constructor(boardId) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .build();
        this.connection.on("receiveNewBoard", (board, groupName) => console.log(board));
        this.connection.invoke("join", boardId);
        this.connection.start();
    }
}
exports.BoardHubConnection = BoardHubConnection;
