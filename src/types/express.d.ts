import "express";

declare module "express" {
    export interface Request {
        user?: {
            username: string;
            sessionId: string;
            userId: string;
        };
    }
}
