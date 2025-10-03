import { RowDataPacket } from 'mysql2/promise'
import { MySqlModel } from '../models/mysqlModel.ts'

export type SQLModel = typeof MySqlModel


export interface UserName extends RowDataPacket {
    username: string
}
export interface UserCredentials extends RowDataPacket {
    username: string
    user_id: string
    password: string
}

export interface UUID extends RowDataPacket {
    uuid: string
}

export interface Owner extends RowDataPacket {
    owner: string
}

export interface BoardBasicInfoDB extends RowDataPacket {
    boardId: string,
    name: string,
    createdAt: Date
}

export interface BoardName extends RowDataPacket {
    name: string
}

export interface ColumnsDB extends RowDataPacket {
    name: string
    id?: string
}

export interface TaskDB extends RowDataPacket {
    id: string
    name: string
    description: string | undefined
    column_id?: string
}

export interface SubtasksDb extends RowDataPacket {
    id: string
    name: string,
    isComplete: 0 | 1,
    task_id?: string
}

export interface BoardWithColumnsDB extends RowDataPacket {
    boardId: string,
    name: string,
    createdAt: Date,
    column_id: string,
    columnName: string
}

export interface ColumnsWithTasks extends RowDataPacket {
    columnId: string,
    column_name: string,
    task_id: string | null,
    task_name: string,
    task_description: string | null,
    task_column_id: string | null,
    subtask_id: string,
    subtask_name: string,
    subtask_isComplete: 0 | 1 | null
}

export interface Session extends RowDataPacket {
    session_id: string
    user_id: string
    createdAt: Date
}
