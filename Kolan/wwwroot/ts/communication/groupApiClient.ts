import { ApiClient } from "./apiClient";
import { RequestType } from "../enums/requestType";
import { Task } from "../models/task";
import { ContentFormatter } from "../processing/contentFormatter";

export class GroupApiClient extends ApiClient {
    public async add(board: Task, name: string): Promise<string> {
        const response = await this.send("Groups", "", RequestType.Post, {
            boardId: board.id,
            name: await ContentFormatter.preBackend(name, board.cryptoKey)
        });

        return JSON.parse(response).id;
    }

    public async delete(boardId: string, groupId: string): Promise<void> {
        await this.send("Groups", groupId, RequestType.Delete, {
            boardId: boardId
        });
    }
}