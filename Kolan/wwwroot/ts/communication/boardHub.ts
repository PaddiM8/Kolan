import * as signalR from "@microsoft/signalr";
import { Board } from "../views/board";
import { ITask } from "../models/ITask";
import { IHub } from "./IHub";
import { RequestParameter } from "./requestParameter";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";
import { ContentFormatter } from "../processing/contentFormatter";

/**
 * Manages the websocket connection and acts on responses.
 */
export class BoardHub implements IHub {
    private connection;
    private boardId;
    private stateToast;

    /**
    * Get the current state of the connection. Eg. connected, connecting, disconnected
    */
    public get state() {
        return this.connection ? this.connection.state : "";
    }

    /**
    * Join a board hub
    */
    public join(boardId: string) {
        this.boardId = boardId;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/hub")
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.start().then(() => {
            this.connection.invoke("join", boardId).catch(err => console.log(err));
        });

        // Execute a function when a SignalR call is received
        this.connection.on("receiveNewBoard", this.onReceiveNewBoard);
        this.connection.on("moveBoard", this.onMoveBoard);
        this.connection.on("editBoard", this.onEditBoard);
        this.connection.on("deleteBoard", this.onDeleteBoard);
        this.connection.on("requestReload", this.onRequestReload);

        // Keep track of the current state
        this.connection.onclose(() => this.onDisconnected());
        this.connection.onreconnecting(() => this.onReconnecting());
        this.connection.onreconnected(() => this.onConnected());
    }

    public addTask(task: ITask, underTask: string) {
        return this.connection.invoke(
            "addBoard",
            this.boardId,
            ContentFormatter.object<ITask>(task, ContentFormatter.preBackend),
            underTask
        );
    }

    public editTask(task: ITask) {
        return this.connection.invoke(
            "editBoard",
            this.boardId,
            ContentFormatter.object<ITask>(task, ContentFormatter.preBackend, ["id"])
        );
    }

    public moveTask(taskId: string, targetId: string): void {
        this.connection.invoke("moveBoard", this.boardId, taskId, targetId)
            .catch(err => console.log(err));
    }

    public deleteTask(taskId: string): void {
        this.connection.invoke("deleteBoard", this.boardId, taskId)
            .catch(err => console.log(err));
    }

    public requestReload() {
        return this.connection.invoke("requestReload", this.boardId);
    }

    private onReceiveNewBoard(board: ITask, groupId: string): void {

        Board.tasklistControllers[groupId].addTask(
            ContentFormatter.object<ITask>(board, ContentFormatter.postBackend, ["id"])
        );
    }

    private onMoveBoard(boardId: string, targetId: string): void {
        const board = document.querySelector(`#tasklists [data-id="${boardId}"]`);
        const tasklistId = board.parentElement.dataset.id;

        Board.tasklistControllers[tasklistId].moveTask(boardId, targetId);
    }

    private onEditBoard(newBoardContent: ITask): void {
        const board = document.querySelector(`#tasklists [data-id="${newBoardContent.id}"]`);
        const tasklistId = board.parentElement.dataset.id;

        Board.tasklistControllers[tasklistId].editTask(
            ContentFormatter.object<ITask>(newBoardContent, ContentFormatter.postBackend, ["id"])
        );
    }

    private onDeleteBoard(boardId: string): void {
        const item = document.querySelector(`#tasklists [data-id="${boardId}"]`)
        if (item) item.parentNode.removeChild(item);
    }

    private onRequestReload(id: string): void {
        Board.reload();
    }

    private onDisconnected(): void {
        if (this.stateToast) this.stateToast.hide();

        const uiBlocker = document.getElementById("uiBlocker");
        uiBlocker.style.display = "block";
        uiBlocker.style.opacity = "1";
        this.stateToast = ToastController.new("Disconnected", ToastType.Warning, true);
    }

    private onConnected(): void {
        if (this.stateToast) this.stateToast.hide();

        const uiBlocker = document.getElementById("uiBlocker");
        uiBlocker.style.opacity = "0";
        ToastController.new("Connected!", ToastType.Info);
        setTimeout(() => {
            uiBlocker.style.display = "none";
        }, 300);
    }

    private onReconnecting(): void {
        if (Board.pageReloadInProgress) return;
        if (this.stateToast) this.stateToast.hide();

        const uiBlocker = document.getElementById("uiBlocker");
        uiBlocker.style.display = "block";
        uiBlocker.style.opacity = "1";
        this.stateToast = ToastController.new("Reconnecting...", ToastType.Warning, true);
    }
}
