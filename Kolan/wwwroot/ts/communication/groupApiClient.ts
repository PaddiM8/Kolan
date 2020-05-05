import { ApiClient } from "./apiClient";
import { RequestType } from "../enums/requestType";

export class GroupApiClient extends ApiClient {
    public async add(boardId: string, name: string): Promise<string> {
        const response = await this.send("Groups", "", RequestType.Post, {
            boardId: boardId,
            name: name
        });

        return JSON.parse(response).id;
    }

    public async delete(boardId: string, groupId: string): Promise<void> {
        await this.send("Groups", groupId, RequestType.Delete, {
            boardId: boardId
        });
    }
}