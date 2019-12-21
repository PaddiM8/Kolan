import * as signalR from "@microsoft/signalr";
import { tasklistControllers } from "../views/board";
import { IBoard } from "../models/IBoard";

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

        this.connection.on("receiveNewBoard", this.onReceiveNewBoard);
        this.connection.on("moveBoard", this.onMoveBoard);
        this.connection.on("editBoard", this.onEditBoard);
    }

    private onReceiveNewBoard(board: IBoard, groupId: string) {
        tasklistControllers[groupId].addTask(board);
    }

    private onMoveBoard(boardId: string, targetId: string) {
        const board = document.querySelector(`#tasklists [data-id="${boardId}"]`);
        const target = document.querySelector(`#tasklists [data-id="${targetId}"]`);
        board.parentNode.removeChild(board);

        // If the target is a board
        if (target.tagName == "DRAGGABLE-ELEMENT") {
            target.parentNode.insertBefore(board, target.nextSibling); // Insert the board under the target inside its parent
        } else {
            // If a board with the targetId does not exist, assume it's for a tasklist and place it at the top of that.
            const tasklist = tasklistControllers[targetId].tasklist;
            if (tasklist.childElementCount > 0) tasklist.insertBefore(board, tasklist.firstChild);
            else tasklist.appendChild(board);
        }
    }

    // Temporary, fix this!
    private onEditBoard(newBoardContent: IBoard) {
        const item = document.querySelector(`#tasklists [data-id="${newBoardContent.id}"]`)
        const name = item.querySelector("h2") as HTMLElement;
        const text = item.querySelector("p") as HTMLElement;

        name.innerHTML = newBoardContent.name;
        text.innerHTML = newBoardContent.description;
    }
}
