import { Board } from "./board";
import { ContentFormatter } from "../processing/contentFormatter";

export class Task extends Board {
    public assignee: string;
    public deadline: number;

    /**
     * Prepare for being sent off to the backend
     */
    public async processPreBackend(): Promise<Task> {
        await this.process(ContentFormatter.preBackend);

        return this;
    }

    /**
     * Process after having received it from the backend
     */
    public async processPostBackend(): Promise<Task> {
        await this.process(ContentFormatter.postBackend);

        return this;
    }
}
