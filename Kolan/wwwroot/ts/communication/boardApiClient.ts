import { ApiClient } from "./apiClient";
import { RequestType } from "../enums/requestType";
import { Task } from "../models/task";
import { Board } from "../models/board";
import { Crypto } from "../processing/crypto";
import { Defaults } from "../defaults";
import { ContentFormatter } from "../processing/contentFormatter";
import { ApiRequester } from "./apiRequester";

export class BoardApiClient extends ApiClient {
    public async getAll(): Promise<{ boards: Task[], keys: { publicKey: string, privateKey: string } }> {
        let result = JSON.parse(await this.send("Boards", "", RequestType.Get));

        // Import/unwrap and save the RSA keys. These will be used to wrap/unwrap board encryption keys.
        await Crypto.setRSAKeys(result.keys.publicKey, result.keys.privateKey);

        // Encryption and such, if needed
        for (let i = 0; i < result.boards.length; i++) {
            result.boards[i] = await new Task(result.boards[i]).processPostBackend();
        }

        return result;
    }

    public async get(id: string): Promise<Board> {
        const board = JSON.parse(await this.send("Boards", id, RequestType.Get)) as Board;
        board.content = await new Task(board.content).processPostBackend();

        // Process ancestors
        if (board.ancestors)
            for (let ancestor of board.ancestors) {
                ancestor.name = await ContentFormatter.postBackend(
                    ancestor.name,
                    board.content.cryptoKey
                );
            }
        
        // Process grops
        if (board.groups)
            for (let group of board.groups) {
                group.groupNode.name = await ContentFormatter.postBackend(
                    group.groupNode.name,
                    board.content.cryptoKey
                );

                for (let i = 0; i < group.tasks.length; i++) {
                    group.tasks[i].encryptionKey = board.content.encryptionKey;
                    group.tasks[i] = await new Task(group.tasks[i]).processPostBackend();
                }
            }

        return board;
    }

    public async add(task: Task): Promise<string> {
        // Generate an encryption key for the board if encryption is enabled.
        // An encrypted version of the key will also be made, and put inside the board object.
        // This will then be unencrypted using a password derived key.
        let cryptoKey: CryptoKey;
        if (task.encrypted) {
            cryptoKey = await Crypto.createEncryptionKey();
            task.encryptionKey = await Crypto.wrapAnyKey(cryptoKey);
        }

        // Create board
        // It is processed before being sent to the backend,
        // this encrypts the board if needed and such.
        const id = JSON.parse(
            await this.send("Boards", "", RequestType.Post, await task.processPreBackend())
        ).id;

        // Set up, since it's a root board
        await this.setup(id, Defaults.groupNames, cryptoKey);

        return id;
    }

    public async edit(id: string, parentId: string, newBoardContent: Task): Promise<void> {
        await this.send("Boards", id, RequestType.Put, {
            parentId: parentId,
            newBoardContent: JSON.stringify(await new Task(newBoardContent).processPreBackend())
        });
    }

    public async delete(id: string, parentId?: string): Promise<void> {
        await this.send("Boards", parentId, RequestType.Delete, {
            boardId: id
        })
    }

    public async setup(id: string, groupNames: string[], cryptoKey?: CryptoKey): Promise<string[]> {
        let processedGroupNames: string[] = [];

        // Create a list of the default group names (and process them)
        for (const groupName of groupNames) {
            processedGroupNames.push(await ContentFormatter.preBackend(groupName, cryptoKey));
        }

        const response = await this.send("Boards", `${id}/Setup`, RequestType.Post, {
            groups: JSON.stringify(processedGroupNames)
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

    public async addUser(board: Task, username: string): Promise<void> {
        let encryptionKey: string;
        if (board.encrypted) {
            // Wrap the board's encryption key using the added user's public key,
            // so that they can unwrap it using their own private key.
            encryptionKey = await Crypto.wrapAnyKey(
                board.cryptoKey,
                await ApiRequester.users.getPublicKey(username)
            );
        }
        await this.send("Boards", `${board.id}/Users`, RequestType.Post, {
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