import { View } from "./view"
import { TasklistController } from "../controllers/tasklistController";
import { ApiRequester } from "../communication/apiRequester";
import { BoardHub } from "../communication/boardHub";
import { Task } from "../models/task";
import { Group } from "../models/group";
import { ToastType } from "../enums/toastType";
import { RequestType } from "../enums/requestType";
import { ToastController } from "../controllers/toastController";
import { PermissionLevel } from "../enums/permissionLevel";
import { ContentFormatter } from "../processing/contentFormatter";
import { Board } from "../models/board";

// Dialogs
import { AddTaskDialog } from "../dialogs/addTaskDialog";
import { EditTaskDialog } from "../dialogs/editTaskDialog";
import { ShareDialog } from "../dialogs/shareDialog";
import { SetupDialog } from "../dialogs/setupDialog";
import { SettingsDialog } from "../dialogs/settingsDialog";

window.addEventListener("load", () => new BoardView());
declare const viewData;

/**
 * In charge of controlling the "Board" page.
 */
export class BoardView extends View {
    public static board: Board;
    public static collaborators: string[];
    public static dialogs;
    public static tasklistControllers = {};
    public static viewData;
    public static pageReloadInProgress = false;
    public static boardHub: BoardHub;
    private currentTasklistId: string;
    private previousTasklist: HTMLElement;

    constructor() {
        super();

        BoardView.boardHub = new BoardHub();
        BoardView.viewData = viewData;

        // Load dialogs
        this.loadDialogs();

        // Load board
        this.loadBoard().then(() => {
            const shareButton = document.getElementById("shareButton");
            shareButton.addEventListener("click", e => {
                BoardView.dialogs.share.shown = true
                BoardView.dialogs.share.setValues({
                    public: BoardView.board.content.public
                });
            });
    
            const settingsButton = document.getElementById("settingsButton");
            settingsButton.addEventListener("click", e => {
                BoardView.dialogs.settings.shown = true;
            });
    
            window.onbeforeunload = () => {
                BoardView.pageReloadInProgress = true;
                return;
            }
    
            window.onfocus = () => {
                if (BoardView.boardHub.state == "Disconnected") {
                    window.location.reload();
                }
            }
    
            // Change structure on smaller screens
            // Click the group heads to show the tasklist
            const tasklists = document.getElementById("tasklists");
            const listhead = document.getElementById("list-head");
            listhead.addEventListener("click", e => {
                if (window.innerWidth > 1000) return;
                const headItem = e.target as HTMLElement;
                const id = headItem.dataset.id;
                const tasklist = tasklists.querySelector(`tasklist[data-id="${id}"`) as HTMLElement;
    
                tasklist.style.display = "block";
                headItem.classList.toggle("selected");
                if (this.previousTasklist) {
                    this.previousTasklist.style.display = "none";
                    const previousHeadItem = listhead.querySelector(`[data-id="${this.previousTasklist.dataset.id}"]`)
                    previousHeadItem.classList.toggle("selected");
                }
    
                this.previousTasklist = tasklist;
            });
        });   
    }

    /**
    * Reload the page in an appropriate manner. If a dialog is open, wait for it to be closed before reloading.
    */
    public static reload(): void {
        for (const dialogName in BoardView.dialogs) {
            const dialog = BoardView.dialogs[dialogName];

            if (dialog.shown) {
                dialog.addEventListener("hideDialog", () => location.reload());
                return;
            }
        }

        location.reload();
    }

    /**
    * Get the id of the root board
    */
    public static getRootId(): string {
        // If the board has ancestors, the the root board id will be the first ancestor's id.
        // If the board doesn't have ancestors, the board is the root board, and this board's id is the root id.
        return BoardView.board.ancestors.length > 0
            ? BoardView.board.ancestors[BoardView.board.ancestors.length - 1].id
            : BoardView.board.content.id;
    }

    /**
     * Add a group to the client side.
     */
    private addGroup(group: Group): void {
        const listhead = document.getElementById("list-head");
        const item = document.createElement("div");
        item.className = "item";
        item.dataset.id = group.id;
        item.dataset.name = group.name;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = group.name;

        item.appendChild(nameSpan);

        if (BoardView.board.userAccess >= PermissionLevel.Edit)
            item.insertAdjacentHTML("beforeend", "<button class='plus'>+</button>")

        listhead.appendChild(item);

        const tasklists = document.getElementById("tasklists") as HTMLElement;
        const tasklistElement = document.createElement("tasklist") as HTMLElement;
        tasklistElement.className = "draggableContainer";
        tasklistElement.dataset.id = group.id;
        tasklists.appendChild(tasklistElement);
        BoardView.tasklistControllers[group.id] = new TasklistController(
            tasklistElement,
            group.name,
            viewData.taskColorSeed
        );

        // Select first group automatically (this will be shown when on a small screen)
        if (tasklists.children.length == 2) {
            tasklistElement.style.display = "block";
            item.classList.toggle("selected");
            this.previousTasklist = tasklistElement;
        }

        // Events
        const plusElements = listhead.getElementsByClassName("plus");
        for (let plus of <any>plusElements) {
            plus.addEventListener("click", e => {
                const groupId = e.currentTarget.parentElement.dataset.id;
                BoardView.dialogs["addTask"].shown = true;
                BoardView.dialogs["addTask"].groupId = groupId;

                this.currentTasklistId = groupId;
            });
        }
    }

    /**
     * Add a task (board) to the client side.
     */
    private addTask(tasklistId: string, task: Task): void {
        const tasklistController: TasklistController = BoardView.tasklistControllers[tasklistId];
        tasklistController.addTask(task);
    }

    /**
     * Prepare the dialogs for use, they are hidden by default. Simply update dialog.shown to show a dialog.
     */
    private loadDialogs(): void {
        const dialogs = {
            addTask: new AddTaskDialog(),
            editTask: new EditTaskDialog(),
            share: new ShareDialog(),
            settings: new SettingsDialog()
        }

        for (const dialogName in dialogs) {
            document.body.appendChild(dialogs[dialogName]);
        }

        BoardView.dialogs = dialogs;
    }

    /**
    * Set the page title (with links to ancestors as well)
    */
    private async setTitle(title: string): Promise<void> {
        document.title = title + " - Kolan";
        let html = BoardView.board.userAccess >= PermissionLevel.Edit
            ? `<a href="/">Boards</a> / `
            : `<a href="/">Kolan</a> / `;

        // Ancestors
        if (BoardView.board.ancestors) {
            const ancestors = BoardView.board.ancestors;
            for (let i = 0; i < ancestors.length; i++) {
                // If there are a lot of ancestors, hide the middle ones
                if (ancestors.length >= 5 && i == 1)
                {
                    html += `<span>...</span> / `
                    i = ancestors.length - 2;
                    continue;
                }

                const ancestor = ancestors[ancestors.length - i - 1]; // Do backwards for correct order
                html += `<a href="./${ancestor.id}">${ancestor.name}</a> / `;
            }
        }

        // Current board
        html += `<span>${title}</span>`;
        document.getElementById("title").insertAdjacentHTML("afterbegin", html);
    }

    /**
     * Load the contents of the board from the backend.
     */
    private async loadBoard(): Promise<void> {
        try {
            // Get board content
            let board = await ApiRequester.boards.get(viewData.id);
            BoardView.board = board;

            // If the request returns nothing, the board hasn't been set up yet. Display the setup dialog.
            if (!board.groups) {
                const setupDialog = new SetupDialog();
                document.body.appendChild(setupDialog);
                setupDialog.shown = true;
                setupDialog.addEventListener("submitDialog", () => {
                    this.loadBoard();
                });
                return;
            }

            // Set title on the client side, both on the board page and in the document title.
            await this.setTitle(board.content.name);

            const tasklists = document.getElementById("tasklists");
            const listHead = document.getElementById("list-head");
            tasklists.style.gridTemplateColumns = `repeat(${board.groups.length}, 1fr)`;
            listHead.style.gridTemplateColumns = tasklists.style.gridTemplateColumns;

            for (const group of board.groups) {
                this.addGroup(group.groupNode as Group);

                for (const task of group.tasks) {
                    this.addTask(group.groupNode.id, task);
                }
            }

            if (BoardView.board.userAccess >= PermissionLevel.Edit) {
                // Connect to SignalR
                BoardView.boardHub.join(BoardView.board.content.id);
            } else {
                // Remove header icons
                const headerIcons = document.querySelector("header .right");
                headerIcons.parentNode.removeChild(headerIcons);
            }

            // Get collaborators
            BoardView.collaborators = await ApiRequester.boards.getUsers(BoardView.board.content.id);

            ToastController.new("Loaded board", ToastType.Info);
        } catch (req) {
            if (req.status == 404) this.setTitle("404 - Board does not exist");
            else if (req.status == 401) this.setTitle("401 - Unauthorized. Are you logged in?");
            else if (req.status > 400 && req.status < 499) this.setTitle(`${req.status} - Client error`);
            else if (req.status > 500 && req.status < 599) this.setTitle(`${req.status} - Server error`);
            console.log(req);
        }
    }
}
