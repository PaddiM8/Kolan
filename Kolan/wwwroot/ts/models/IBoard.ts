export interface IBoard {
    id: string;
    name: string;
    description: string;
    encrypted: boolean;
    encryptionKey?: string;
    public?: boolean;
    tags?: string;
}
