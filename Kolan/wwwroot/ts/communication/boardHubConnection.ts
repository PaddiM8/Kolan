import * as signalR from "@microsoft/signalr";

export class BoardHubConnection {
    connection;

    constructor(boardId: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .build();

        this.connection.on("receiveNewBoard", (board, groupName) => console.log(board));
        this.connection.invoke("join", boardId);
        this.connection.start();
    }
}
