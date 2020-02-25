import { IBoard } from "./IBoard";

export interface ITask extends IBoard {
    assignee: string;
}
