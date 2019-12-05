import * as signalR from "@microsoft/signalr";

export class BoardHubConnection {
    connection;

    constructor(boardId: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .build();

        this.connection.on("receiveMessage", message => console.log(message));
        this.connection.invoke("join", boardId);
    }
}
