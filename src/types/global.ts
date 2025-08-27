import z from 'zod'
import { RowDataPacket } from 'mysql2/promise'
import { MySqlModel } from "../models/mysqlModel.js";
import { userSchema } from "../schema/userSchema.js";
import { boardSchema } from 'src/schema/boardSchema.js';


export type SQLModel = typeof MySqlModel

export type UserDTO = z.infer<typeof userSchema>
export type UserParams = { username: string, password: string }

export type BoardBasicInfoDTO = z.infer<typeof boardSchema>

export interface UserRow extends RowDataPacket {
    username: string
}
export interface UserDb extends RowDataPacket {
    username: string
    user_id: string
    password: string
}

export interface UUIDResponse extends RowDataPacket {
    uuid: string
}

export interface ResponseError extends Error {
    statusCode: number
}

export interface Payload {
    userId: string;
    username: string;
    sessionId: string;
}

export interface VerifyResult {
    payload: Payload | null;
    expired: boolean;
}

export interface Owner extends RowDataPacket {
    owner: string
}

declare module 'express' {
    export interface Request {
        user?: {
            username: string,
            sessionId: string,
            userId: string
        }
    }
}