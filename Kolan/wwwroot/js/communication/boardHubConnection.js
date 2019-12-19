"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signalR = require("@microsoft/signalr");
class BoardHubConnection {
    constructor(boardId) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();
        this.connection.start().then(() => {
            this.connection.invoke("join", boardId).catch(err => console.log(err));
        });
        this.connection.on("receiveNewBoard", (board, groupId) => console.log(board));
    }
}
exports.BoardHubConnection = BoardHubConnection;
