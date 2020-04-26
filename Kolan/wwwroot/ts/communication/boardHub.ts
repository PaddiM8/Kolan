import * as signalR from "@microsoft/signalr";
import { BoardView } from "../views/boardView";
import { Task } from "../models/task";
import { IHub } from "./IHub";
import { ToastController } from "../controllers/toastController";
import { ToastType } from "../enums/toastType";

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

    public async addTask(task: Task, underTask: string) {
        task.encrypted = BoardView.content.encrypted;
        task.encryptionKey = BoardView.content.encryptionKey;

        const formattedTask = await new Task(task, BoardView.content.cryptoKey).processPreBackend();
        return this.connection.invoke("addBoard", this.boardId, formattedTask, underTask);
    }

    public async editTask(task: Task) {
        const formattedTask = await new Task(task, BoardView.content.cryptoKey).processPreBackend();

        return this.connection.invoke("editBoard", this.boardId, formattedTask);
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

    private async onReceiveNewBoard(task: Task, groupId: string): Promise<void> {
        const processedTask = await new Task(task, BoardView.content.cryptoKey).processPostBackend();
        BoardView.tasklistControllers[groupId].addTask(processedTask);
    }

    private onMoveBoard(boardId: string, targetId: string): void {
        const board = document.querySelector(`#tasklists [data-id="${boardId}"]`);
        const tasklistId = board.parentElement.dataset.id;

        BoardView.tasklistControllers[tasklistId].moveTask(boardId, targetId);
    }

    private async onEditBoard(newTaskContent: Task): Promise<void> {
        const board = document.querySelector(`#tasklists [data-id="${newTaskContent.id}"]`);
        const tasklistId = board.parentElement.dataset.id;

        const processedTask = await new Task(newTaskContent, BoardView.content.cryptoKey).processPostBackend();
        BoardView.tasklistControllers[tasklistId].editTask(processedTask);
    }

    private onDeleteBoard(boardId: string): void {
        const item = document.querySelector(`#tasklists [data-id="${boardId}"]`)
        if (item) item.parentNode.removeChild(item);
    }

    private onRequestReload(): void {
        BoardView.reload();
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
        if (BoardView.pageReloadInProgress) return;
        if (this.stateToast) this.stateToast.hide();

        const uiBlocker = document.getElementById("uiBlocker");
        uiBlocker.style.display = "block";
        uiBlocker.style.opacity = "1";
        this.stateToast = ToastController.new("Reconnecting...", ToastType.Warning, true);
    }
}
