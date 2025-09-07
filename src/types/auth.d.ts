export interface Payload {
    userId: string;
    username: string;
    sessionId: string;
}

export interface VerifyResult {
    payload: Payload | null;
    expired: boolean;
}
