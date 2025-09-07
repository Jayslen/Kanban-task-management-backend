import { ResultSetHeader } from 'mysql2/promise'
import bcrypt from 'bcrypt'
import { UserParams } from '@CustomTypes/user'
import { BoardBasicInfoDTO, BoardTask, Column } from '@CustomTypes/board'
import { UserName, UUID, UserCredentials, BoardBasicInfoDB, TaskDB, SubtasksDb, ColumnsDB, BoardWithColumnsDB, ColumnsWithTasks } from '@CustomTypes/db'
import { getBoardBasicInfo, getBoardBasicInfoByOwner, getBoardWithColumns, getColumns, getColumnsWithTasks } from '../utils/dbQueries.js'
import {
    UserNotAvailable,
    UserNotFound,
    WrongUserPassword
} from '../schema/Errors.js'
import { getDb } from '../utils/db.js'

const db = await getDb()

export class MySqlModel {
    static resister = async (input: UserParams) => {
        const { username, password } = input

        const [users] = await db.query<UserName[]>(
            'SELECT username FROM users WHERE LOWER(username) = LOWER(?)',
            [username]
        )

        if (users.length > 0) {
            throw new UserNotAvailable()
        }

        const [[{ uuid }]] = await db.query<UUID[]>('SELECT uuid() AS uuid')
        await db.query(
            'INSERT INTO users (user_id, username, password) VALUES (UUID_TO_BIN(?),?,?)',
            [uuid, username, password]
        )
    }

    static login = async (input: UserParams) => {
        const { username, password } = input

        const [[userFound]] = await db.query<UserCredentials[]>(
            `SELECT 
                username, password, BIN_TO_UUID(user_id) AS user_id 
            FROM users WHERE LOWER(username) = LOWER(?)`,
            [username]
        )
        if (!userFound) {
            throw new UserNotFound()
        }

        const isPasswordCorrect = await bcrypt.compare(password, userFound.password)

        if (!isPasswordCorrect) {
            throw new WrongUserPassword()
        }

        const [[{ uuid: sessionUUID }]] = await db.query<UUID[]>('SELECT uuid() AS uuid')
        const [results] = await db.query<ResultSetHeader>(
            `INSERT INTO sessions (session_id,user_id)
            VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?))`,
            [sessionUUID, userFound.user_id]
        )

        if (results.affectedRows !== 1) throw new Error('Error with server')

        return { userId: userFound.user_id, sessionId: sessionUUID, username: userFound.username }
    }

    static newBoard = async (input: { board: BoardBasicInfoDTO, userId: string }) => {
        const { board, userId } = input
        const [[{ uuid }]] = await db.query<UUID[]>('SELECT uuid() AS uuid')

        const columnsPlaceholders = board.columns.map(() => '(?, UUID_TO_BIN(?))').join(', ');
        const columnsParams = board.columns.flatMap(name => [name, uuid]);
        const columnsQuery = `INSERT INTO board_columns (name, board) VALUES ${columnsPlaceholders}`;


        await db.query('INSERT INTO boards (board_id, name, owner) VALUES (UUID_TO_BIN(?),?,UUID_TO_BIN(?))', [uuid, board.name, userId])
        await db.query(columnsQuery, columnsParams);

        const [[newBoard]] = await db.query<BoardBasicInfoDB[]>(getBoardBasicInfo, [uuid])
        const [boardColumns] = await db.query(getColumns, [uuid])

        return { ...newBoard, columns: boardColumns }
    }

    static updateBoard = async (input: {
        colsToUpdate: { id: number, payload: string }[]
        colsToRemove: { id: number, remove: boolean }[]
        colsToAdd: string[]
        name: string
        boardId: string
    }) => {
        const { colsToRemove, colsToUpdate, colsToAdd, name, boardId } = input

        if (name) {
            await db.query('UPDATE BOARDS SET name = ? WHERE BIN_TO_UUID(board_id) = ?', [name, boardId])
        }


        if (colsToRemove.length > 0) {
            await db.query(`DELETE FROM columns WHERE column_id IN (${colsToRemove.map(col => col.id).join(',')})`)
        }

        if (colsToUpdate.length > 0) {
            const whenStatements = colsToUpdate.map(({ id, payload }) => `WHEN ${id} THEN "${payload}"`).join(' ')
            const ids = colsToUpdate.map(col => col.id).join(',')
            const query = `UPDATE board_columns SET name = CASE column_id ${whenStatements} END WHERE column_id IN (${ids}) AND BIN_TO_UUID(board) = ?`
            await db.query(query, [boardId])
        }

        if (colsToAdd.length > 0) {
            const params = colsToAdd.map(col => `("${col}", UUID_TO_BIN("${boardId}"))`).join(', ')
            await db.query(`INSERT INTO board_columns (name, board) VALUES ${params}`, [...colsToAdd])
        }

        const [boardWithCols] = await db.query<BoardWithColumnsDB[]>(getBoardWithColumns, [boardId])

        const boardName = boardWithCols[0].name
        const columns = boardWithCols.map(col => ({ id: col.column_id, name: col.columnName }))
        return { board: boardName, columns }
    }

    static deleteBoard = async (boardId: string) => {
        await db.query('DELETE FROM boards WHERE BIN_TO_UUID(board_id) = ?', [boardId])
    }

    static createTask = async (input: { boardId: string, task: BoardTask }) => {
        const { boardId, task: { name, status, description, subtasks } } = input

        const [[{ uuid: newTaskId }]] = await db.query<UUID[]>('SELECT uuid() AS uuid')

        await db.query(`
            INSERT INTO tasks (task_id,board_id,name,description,column_id)
            VALUES (UUID_TO_BIN(?),UUID_TO_BIN(?),?,?,?)`,
            [newTaskId, boardId, name, description, status])


        if (subtasks.length > 0) {
            const subtasksValues = subtasks.map(task => `(UUID_TO_BIN('${newTaskId}'),'${task}')`).join(',')
            await db.query(`INSERT INTO subtasks (task, name) VALUES ${subtasksValues}`)
        }

        const [[taskCreated]] = await db.query<TaskDB[]>('SELECT BIN_TO_UUID(task_id) AS id, name, description FROM tasks WHERE task_id = UUID_TO_BIN(?)', [newTaskId])
        const [subtaskResults] = await db.query<SubtasksDb[]>('SELECT subtask_id AS id, name, isComplete FROM subtasks WHERE BIN_TO_UUID(task) = ?', [newTaskId])
        const [[taskStatus]] = await db.query<ColumnsDB[]>(getColumns, [status])

        return {
            ...taskCreated, status: taskStatus.name, subtasks: subtaskResults.map(task => ({ ...task, isComplete: Boolean(task.isComplete) }))
        }
    }

    static updateTask = async (input:
        {
            boardId: string,
            taskId: string,
            name: string | undefined,
            description: string | undefined,
            status: number | undefined,
            tasktoDelete: number[],
            tasktoUpdate: { name: string, id: number }[],
            tasktoAdd: string[]
        }) => {
        const { boardId, taskId, name, description, tasktoAdd, tasktoDelete, tasktoUpdate } = input

        if (name) {
            await db.query('UPDATE tasks SET name = ? WHERE BIN_TO_UUID(task_id) = ? AND BIN_TO_UUID(board_id) = ?', [name, taskId, boardId])
        }
        if (description) {
            await db.query('UPDATE tasks SET description = ? WHERE BIN_TO_UUID(task_id) = ? AND BIN_TO_UUID(board_id) = ?', [description, taskId, boardId])
        }

        if (tasktoDelete.length > 0) {
            await db.query(`DELETE FROM subtasks WHERE subtask_id IN (${tasktoDelete.join(',')}) AND BIN_TO_UUID(task) = ?`, [taskId])
        }


        if (tasktoUpdate.length > 0) {
            const whenStatements = tasktoUpdate.map(({ id, name }) => `WHEN ${id} THEN "${name}"`).join(' ')
            const ids = tasktoUpdate.map(task => task.id).join(',')
            const query = `UPDATE subtasks SET name = CASE subtask_id ${whenStatements} END WHERE subtask_id IN (${ids}) AND BIN_TO_UUID(task) = ?`
            await db.query(query, [taskId])
        }

        if (tasktoAdd.length > 0) {
            const subtasksValues = tasktoAdd.map(name => `(UUID_TO_BIN('${taskId}'),'${name}')`).join(',')
            await db.query(`INSERT INTO subtasks (task, name) VALUES ${subtasksValues}`)
        }
    }

    static deleteTask = async (input: { boardId: string, taskId: string }) => {
        const { boardId, taskId } = input
        await db.query('DELETE FROM tasks WHERE BIN_TO_UUID(task_id) = ? AND BIN_TO_UUID(board_id) = ?', [taskId, boardId])
    }

    static getBoards = async (userId: string) => {
        const [boards] = await db.query<BoardBasicInfoDB[]>(getBoardBasicInfoByOwner, [userId])

        return boards

    }

    static getBoardById = async (boardId: string) => {
        const [[board]] = await db.query<BoardBasicInfoDB[]>(getBoardBasicInfo, [boardId])

        if (!board) throw new Error('Board not found')

        const [rows] = await db.query<ColumnsWithTasks[]>(getColumnsWithTasks, [boardId, boardId]);

        const columns = rows.reduce<Column[]>((acc, row) => {
            let column = acc.find(col => col.id === row.columnId);
            if (!column) {
                column = { id: row.column_id, name: row.column_name, tasks: [] };
                acc.push(column);
            }

            if (row.task_id) {
                let task = column.tasks.find(t => t.id === row.task_id);
                if (task) {
                    task = {
                        id: row.task_id,
                        name: row.task_name,
                        description: row.task_description,
                        column_id: row.columnId,
                        subtasks: []
                    };
                    column.tasks.push(task);

                    if (row.subtask_id) {
                        task.subtasks.push({
                            id: row.subtask_id,
                            name: row.subtask_name,
                            isComplete: !!row.subtask_isComplete,
                            task_id: row.task_id
                        });
                    }
                }
            }

            return acc;
        }, []);

        return { ...board, columns }
    }
}
