import z from 'zod'
import { RowDataPacket } from 'mysql2/promise'
import { MySqlModel } from "../models/mysqlModel.js";
import { userSchema } from "../schema/userSchema.js";
import { boardSchema, taskBoardSchema } from 'src/schema/boardSchema.js';

declare module 'express' {
    export interface Request {
        user?: {
            username: string,
            sessionId: string,
            userId: string
        }
    }
}

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

export interface Owner extends RowDataPacket {
    owner: string
}

export type BoardTask = z.infer<typeof taskBoardSchema>

export interface TaskDb extends RowDataPacket {
    name: string
    description: string
}

export interface SubtasksDb extends RowDataPacket {
    name: string,
    isComplete: 0 | 1
}

export interface DbUUID extends RowDataPacket {
    uuid: string
}

export interface ResponseError extends Error {
    statusCode: number
    errors?: [string, unknown][]
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


type Subtask = {
    id: number;
    name: string;
    isComplete: boolean;
    task_id: string;
};

type Task = {
    id: string;
    name: string | null;
    description: string | null;
    column_id: number | null;
    subtasks: Subtask[];
};

export type Column = {
    id: number;
    name: string;
    tasks: Task[];
};