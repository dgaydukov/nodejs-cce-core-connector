

export interface ISocketMessage {
    name: string;
    value: string;
    appId: string;
    type: number;
    processed: number;
    hash: string;
    createdAt: Date;
}