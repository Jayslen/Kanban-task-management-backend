import z from 'zod'
import { RowDataPacket } from 'mysql2/promise'
import { MySqlModel } from "../models/mysqlModel.js";
import { userSchema } from "../schema/userSchema.js";


export type SQLModel = typeof MySqlModel
export type UserDTO = z.infer<typeof userSchema>
export type UserParams = { username: string, password: string }

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