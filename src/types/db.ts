import { RowDataPacket } from 'mysql2/promise'

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
    id?: number
}

export interface TaskDB extends RowDataPacket {
    id: string
    name: string
    description: string | undefined
    column_id?: number
}

export interface SubtasksDb extends RowDataPacket {
    id: number
    name: string,
    isComplete: 0 | 1,
    task_id?: string
}

export interface BoardWithColumnsDB extends RowDataPacket {
    boardId: string,
    name: string,
    createdAt: Date,
    column_id: number,
    columnName: string
}

export interface ColumnsWithTasks extends RowDataPacket {
    columnId: number,
    column_name: string,
    task_id: string | null,
    task_name: string,
    task_description: string | null,
    task_column_id: number | null,
    subtask_id: number,
    subtask_name: string,
    subtask_isComplete: 0 | 1 | null
}

export interface Session extends RowDataPacket {
    session_id: string
    user_id: string
    createdAt: Date
}
