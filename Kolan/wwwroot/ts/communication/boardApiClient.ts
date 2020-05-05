import { ApiClient } from "./apiClient";
import { RequestType } from "../enums/requestType";
import { Task } from "../models/task";
import { Board } from "../models/board";

export class BoardApiClient extends ApiClient {
    public async getAll(): Promise<{ boards: Task[], keys: { publicKey: string, privateKey: string } }> {
        return JSON.parse(await this.send("Boards", "", RequestType.Get));
    }

    public async get(id: string): Promise<Board> {
        return JSON.parse(await this.send("Boards", id, RequestType.Get));
    }

    public async add(task: Task): Promise<string> {
        return JSON.parse(await this.send("Boards", "", RequestType.Post, task)).id;
    }

    public async edit(id: string, parentId: string, newBoardContent: Task): Promise<void> {
        await this.send("Boards", id, RequestType.Put, {
            parentId: parentId,
            newBoardContent: JSON.stringify(newBoardContent)
        });
    }

    public async delete(id: string, parentId?: string): Promise<void> {
        await this.send("Boards", parentId, RequestType.Delete, {
            boardId: id
        })
    }

    public async setup(id: string, groupNames: string[]): Promise<string[]> {
        const response = await this.send("Boards", `${id}/Setup`, RequestType.Post, {
            groups: JSON.stringify(groupNames)
        });

        return JSON.parse(response);
    }

    public async move(id: string, targetId: string): Promise<void> {
        await this.send("Boards", "Move", RequestType.Post, {
            id: id,
            targetId: targetId
        });
    }

    public async changeGroupOrder(id: string, groupIds: string[]): Promise<void> {
        await this.send("Boards", `${id}/ChangeGroupOrder`, RequestType.Post, {
            groupIds: JSON.stringify(groupIds)
        });
    }

    public async changePublicity(id: string, isPublic: boolean): Promise<void> {
        await this.send("Boards", `${id}/ChangePublicity`, RequestType.Post, {
            publicity: isPublic
        });
    }

    public async getUsers(id: string): Promise<string[]> {
        return JSON.parse(await this.send("Boards", `${id}/Users`, RequestType.Get));
    }

    public async addUser(id: string, username: string, encryptionKey: string): Promise<void> {
        await this.send("Boards", `${id}/Users`, RequestType.Post, {
            username: username,
            encryptionKey: encryptionKey
        });
    }

    public async removeUser(id: string, username: string): Promise<void> {
        await this.send("Boards", `${id}/Users`, RequestType.Delete, {
            username: username
        });
    }
}