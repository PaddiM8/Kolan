import * as signalR from "@microsoft/signalr";
import { tasklistControllers } from "../views/board";

export class BoardHubConnection {
    connection;

    constructor(boardId: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.start().then(() => {
            this.connection.invoke("join", boardId).catch(err => console.log(err));
        });

        this.connection.on("receiveNewBoard", (board, groupId) => {
            tasklistControllers[groupId].addTask(board);
        });
    }
}
