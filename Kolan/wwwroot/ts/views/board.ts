import { View } from "../views/view"
import { DialogBox } from "../components/dialogBox"
import { InputList } from "../components/inputList"
import { TasklistController } from "../controllers/tasklistController";
import { ApiRequester } from "../communication/apiRequester";
import { RequestParameter } from "../communication/requestParameter"
import { BoardHub } from "../communication/boardHub";
import { ITask } from "../models/ITask";
import { IGroup } from "../models/IGroup";
import { ToastType } from "../enums/toastType";
import { RequestType } from "../enums/requestType";
import { ToastNotif } from "../components/toastNotif";
import { ToastController } from "../controllers/toastController";
import { IBoard } from "../models/IBoard";
import { PermissionLevel } from "../enums/permissionLevel";
import { ContentFormatter } from "../processing/contentFormatter";

// Dialogs
import { AddTaskDialog } from "../dialogs/addTaskDialog";
import { EditTaskDialog } from "../dialogs/editTaskDialog";
import { ShareDialog } from "../dialogs/shareDialog";
import { SetupDialog } from "../dialogs/setupDialog";
import { SettingsDialog } from "../dialogs/settingsDialog";

window.addEventListener("load", () => new Board());
declare const viewData;

/**
 * In charge of controlling the "Board" page.
 */
export class Board extends View {
    public static content: IBoard;
    public static parentId: string;
    public static collaborators: string[];
    public static permissionLevel: PermissionLevel;
    public static dialogs;
    public static tasklistControllers = {};
    public static viewData;
    public static pageReloadInProgress = false;
    public static boardHub: BoardHub = new BoardHub();
    private currentTasklistId: string;
    private previousTasklist: HTMLElement;

    constructor() {
        super();

        Board.viewData = viewData;

        // Load dialogs
        this.loadDialogs();

        // Load board
        this.loadBoard();

        const shareButton = document.getElementById("shareButton");
        shareButton.addEventListener("click", e => {
            Board.dialogs.share.shown = true
            Board.dialogs.share.setValues({
                public: Board.content.public
            });
        });

        const settingsButton = document.getElementById("settingsButton");
        settingsButton.addEventListener("click", e => {
            Board.dialogs.settings.shown = true;
        });

        window.onbeforeunload = () => {
            Board.pageReloadInProgress = true;
            return;
        }

        window.onfocus = () => {
            if (Board.boardHub.state == "Disconnected") {
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
    }

    /**
    * Reload the page in an appropriate manner. If a dialog is open, wait for it to be closed before reloading.
    */
    public static reload(): void {
        for (const dialogName in Board.dialogs) {
            const dialog = Board.dialogs[dialogName];

            if (dialog.shown) {
                console.log(dialog);
                dialog.addEventListener("hideDialog", () => location.reload());
                return;
            }
        }

        location.reload();
    }

    /**
     * Add a group to the client side.
     */
    private addGroup(group: IGroup): void {
        const listhead = document.getElementById("list-head");
        const item = document.createElement("div");
        item.className = "item";
        item.dataset.id = group.id;
        item.dataset.name = group.name;
        item.textContent = group.name;

        if (Board.permissionLevel >= PermissionLevel.Edit)
            item.insertAdjacentHTML("beforeend", "<span class='plus'>+</span>")

        listhead.appendChild(item);

        const tasklists = document.getElementById("tasklists") as HTMLElement;
        const tasklistElement = document.createElement("tasklist") as HTMLElement;
        tasklistElement.className = "draggableContainer";
        tasklistElement.dataset.id = group.id;
        tasklists.appendChild(tasklistElement);
        Board.tasklistControllers[group.id] = new TasklistController(
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
                Board.dialogs["addTask"].shown = true;
                Board.dialogs["addTask"].groupId = groupId;

                this.currentTasklistId = groupId;
            });
        }
    }

    /**
     * Add a task (board) to the client side.
     */
    private addTask(tasklistId: string, task: ITask): void {
        const tasklist: HTMLElement = document.querySelector(`#tasklists tasklist[data-id='${tasklistId}']`);
        const tasklistController: TasklistController = Board.tasklistControllers[tasklistId];
        tasklistController.addTask(task);
    }

    private onUserAdded(username: string, inputList: InputList): void {
        ApiRequester.send("Boards", `${Board.viewData.id}/Users`, RequestType.Post, {
            username: username
        })
        .then(() => {
            ToastController.new("Collaborator added", ToastType.Info);
        })
        .catch(() => {
            ToastController.new("Failed to add collaborator", ToastType.Error);
            inputList.undoAdd();
        });
    }

    private onUserRemoved(username: string): void {
        ApiRequester.send("Boards", `${Board.viewData.id}/Users`, RequestType.Delete, {
            username: username
        });
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

        Board.dialogs = dialogs;
    }

    /**
    * Set the page title (with links to ancestors as well)
    */
    private setTitle(title: string, ancestors: object[]) {
        document.title = title + " - Kolan";
        let html = Board.permissionLevel >= PermissionLevel.Edit
            ? `<a href="/">Boards</a> / `
            : `<a href="/">Kolan</a> / `;

        // Ancestors
        if (ancestors)
            for (let i = 0; i < ancestors.length; i++) {
                // If there are a lot of ancestors, hide the middle ones
                if (ancestors.length >= 5 && i == 1)
                {
                    html += `<span>...</span> / `
                    i = ancestors.length - 2;
                    continue;
                }

                const ancestor = ancestors[ancestors.length - i - 1]; // Do backwards for correct order
                const name = ancestor["name"];
                const id = ancestor["id"];
                html += `<a href="./${id}">${name}</a> / `;
            }

        // Current board
        html += `<span>${title}</span>`;

        document.getElementById("title").insertAdjacentHTML("afterbegin", html);
    }

    /**
     * Load the contents of the board from the backend.
     */
    private loadBoard(): void {
        const boardNameElement = document.getElementById("boardName");

        // Get board content
        ApiRequester.send("Boards", Board.viewData.id, RequestType.Get).then(result => {
            const boardContent = JSON.parse(result as string);

            // If the request returns nothing, the board hasn't been set up yet. Display the setup dialog.
            if (!boardContent.groups) {
                const setupDialog = new SetupDialog();
                document.body.appendChild(setupDialog);
                setupDialog.shown = true;
                setupDialog.addEventListener("submitDialog", (e: CustomEvent) => {
                    this.loadBoard();
                });
                return;
            }

            // Get permission level
            Board.permissionLevel = boardContent.userAccess as PermissionLevel;

            // Set title on the client side, both on the board page and in the document title.
            this.setTitle(boardContent.board.name, boardContent.ancestors);

            const tasklists = document.getElementById("tasklists");
            const listHead = document.getElementById("list-head");
            tasklists.style.gridTemplateColumns = `repeat(${boardContent.groups.length}, 1fr)`;
            listHead.style.gridTemplateColumns = tasklists.style.gridTemplateColumns;

            for (const groupObject of boardContent.groups) {
                this.addGroup(groupObject.group);

                for (const board of groupObject.boards) {
                    this.addTask(
                        groupObject.group.id,
                        ContentFormatter.object<ITask>(board, ContentFormatter.postBackend, ["id"])
                    );
                }
            }

            Board.content = boardContent.board;

            // Save the parent board id in a variable for easy access, if the board has a parent
            if (boardContent.ancestors && boardContent.ancestors.length > 0)
                Board.parentId = boardContent.ancestors[0]["id"];

            if (Board.permissionLevel >= PermissionLevel.Edit) {
                // Connect to SignalR
                    Board.boardHub.join(Board.viewData.id);
            } else {
                // Remove header icons
                const headerIcons = document.querySelector("header .right");
                headerIcons.parentNode.removeChild(headerIcons);
            }

            // Get collaborators
            ApiRequester.send("Boards", `${viewData.id}/Users`, RequestType.Get)
            .then(response => {
                Board.collaborators = JSON.parse(response as string);
            });

            ToastController.new("Loaded board", ToastType.Info);
        }).catch((req) => {
            if (req.status == 404) this.setTitle("404 - Board does not exist", []);
            else if (req.status == 401) this.setTitle("401 - Unauthorized. Are you logged in?", []);
            else if (req.status > 400 && req.status < 499) this.setTitle(`${req.status} - Client error`, []);
            else if (req.status > 500 && req.status < 599) this.setTitle(`${req.status} - Server error`, []);
            console.log(req);
        });
    }
}
