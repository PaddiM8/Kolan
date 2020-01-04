import * as signalR from "@microsoft/signalr";
import { Board } from "../views/board";
import { IBoard } from "../models/IBoard";
import { IHub } from "./IHub";
import { RequestParameter } from "./requestParameter";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";

/**
 * Manages the websocket connection and acts on responses.
 * @name BoardHubConnection
 * @function
 */
export class BoardHub implements IHub {
    private static connection;
    private static boardId;
    private static stateToast;

    public static get state() {
        return BoardHub.connection.state;
    }

    public join(boardId: string) {
        BoardHub.boardId = boardId;

        BoardHub.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        BoardHub.connection.start().then(() => {
            BoardHub.connection.invoke("join", boardId).catch(err => console.log(err));
        });

        BoardHub.connection.on("receiveNewBoard", this.onReceiveNewBoard);
        BoardHub.connection.on("moveBoard", this.onMoveBoard);
        BoardHub.connection.on("editBoard", this.onEditBoard);
        BoardHub.connection.on("deleteBoard", this.onDeleteBoard);

        BoardHub.connection.onclose(() => BoardHub.onDisconnected());
        BoardHub.connection.onreconnecting(() => BoardHub.onReconnecting());
        BoardHub.connection.onreconnected(() => BoardHub.onConnected());
    }

    public addTask(task: object, boardId: string): string {
        const result = BoardHub.connection.invoke("addBoard", BoardHub.boardId, task, boardId);

        return result["id"];
    }

    public editTask(task: object) {
        BoardHub.connection.invoke("editBoard", BoardHub.boardId, task);
    }

    public moveTask(taskId: string, targetId: string): void {
        BoardHub.connection.invoke("moveBoard", BoardHub.boardId, taskId, targetId)
            .catch(err => console.log(err));
    }

    public deleteTask(taskId: string): void {
        BoardHub.connection.invoke("deleteBoard", BoardHub.boardId, taskId)
            .catch(err => console.log(err));
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

    private static onDisconnected(): void {
        if (BoardHub.stateToast) BoardHub.stateToast.hide();

        const uiBlocker = document.getElementById("uiBlocker");
        uiBlocker.style.display = "block";
        uiBlocker.style.opacity = "1";
        BoardHub.stateToast = ToastController.new("Disconnected", ToastType.Warning, true);
    }

    private static onConnected(): void {
        if (BoardHub.stateToast) BoardHub.stateToast.hide();

        const uiBlocker = document.getElementById("uiBlocker");
        uiBlocker.style.opacity = "0";
        ToastController.new("Connected!", ToastType.Info);
        setTimeout(() => {
            uiBlocker.style.display = "none";
        }, 300);
    }

    private static onReconnecting(): void {
        if (Board.pageReloadInProgress) return;
        if (BoardHub.stateToast) BoardHub.stateToast.hide();

        const uiBlocker = document.getElementById("uiBlocker");
        uiBlocker.style.display = "block";
        uiBlocker.style.opacity = "1";
        BoardHub.stateToast = ToastController.new("Reconnecting...", ToastType.Warning, true);
    }
}
