import { Task } from "./task";
import { Group } from "./group";
import { PermissionLevel } from "../enums/permissionLevel";

export class Board {
    public content: Task;
    public groups: { groupNode: Group, tasks: Task[] }[]
    public ancestors: { id: string, name: string }[];
    public userAccess: PermissionLevel;
}
