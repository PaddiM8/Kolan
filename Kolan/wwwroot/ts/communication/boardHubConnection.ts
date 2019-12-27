import * as signalR from "@microsoft/signalr";
import { Board } from "../views/board";
import { IBoard } from "../models/IBoard";

export class BoardHubConnection {
    private connection;

    constructor(boardId: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.start().then(() => {
            this.connection.invoke("join", boardId).catch(err => console.log(err));
        });

        this.connection.on("receiveNewBoard", this.onReceiveNewBoard);
        this.connection.on("moveBoard", this.onMoveBoard);
        this.connection.on("editBoard", this.onEditBoard);
        this.connection.on("deleteBoard", this.onDeleteBoard);
    }

    private onReceiveNewBoard(board: IBoard, groupId: string): void {
        Board.tasklistControllers[groupId].addTask(board);
    }

    private onMoveBoard(boardId: string, targetId: string): void {
        const board = document.querySelector(`#tasklists [data-id="${boardId}"]`);
        const tasklistId = board.parentElement.dataset.id;

        Board.tasklistControllers[tasklistId].moveTask(boardId, targetId);
    }

    private onEditBoard(newBoardContent: IBoard): void {
        const board = document.querySelector(`#tasklists [data-id="${newBoardContent.id}"]`);
        const tasklistId = board.parentElement.dataset.id;

        Board.tasklistControllers[tasklistId].editTask(newBoardContent);
    }

    private onDeleteBoard(boardId: string): void {
        const item = document.querySelector(`#tasklists [data-id="${boardId}"]`)
        if (item) item.parentNode.removeChild(item);
    }
}
