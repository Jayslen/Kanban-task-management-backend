import { ResultSetHeader } from 'mysql2/promise'
import bcrypt from 'bcrypt'
import { BoardBasicInfoDTO, UserDb, UserParams, UserRow } from '@Types/global'
import {
    UserNotAvailable,
    UserNotFound,
    WrongUserPassword,
} from '../schema/Errors.js'
import { getDb } from '../utils/db.js'

const db = await getDb()

export class MySqlModel {
    static resister = async (input: UserParams) => {
        const { username, password } = input

        const [users] = await db.query<UserRow[]>(
            'SELECT username FROM users WHERE LOWER(username) = LOWER(?)',
            [username]
        )

        if (users.length > 0) {
            throw new UserNotAvailable()
        }

        // @ts-expect-error: Not type yet
        const [[{ uuid }]] = await db.query('SELECT uuid() AS uuid')
        await db.query(
            'INSERT INTO users (user_id, username, password) VALUES (UUID_TO_BIN(?),?,?)',
            [uuid, username, password]
        )
    }

    static login = async (input: UserParams) => {
        const { username, password } = input

        const [[userFound]] = await db.query<UserDb[]>(
            'SELECT username, password, BIN_TO_UUID(user_id) AS user_id FROM users WHERE LOWER(username) = LOWER(?)',
            [username]
        )
        if (!userFound) {
            throw new UserNotFound()
        }

        const isPasswordCorrect = await bcrypt.compare(password, userFound.password)

        if (!isPasswordCorrect) {
            throw new WrongUserPassword()
        }

        const [[{ sessionUUID }]] = await db.query('SELECT uuid() AS sessionUUID')
        const [results] = await db.query<ResultSetHeader>(
            'INSERT INTO sessions (session_id,user_id) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?))',
            [sessionUUID, userFound.user_id]
        )

        if (results.affectedRows !== 1) throw new Error('Error with server')

        return { userId: userFound.user_id, sessionId: sessionUUID, username: userFound.username }
    }

    static newBoard = async (input: { board: BoardBasicInfoDTO, userId: string }) => {
        const { board, userId } = input
        const [[{ uuid }]] = await db.query('SELECT uuid() AS uuid')

        const columnsPlaceholders = board.columns.map(() => '(?, UUID_TO_BIN(?))').join(', ');
        const columnsParams = board.columns.flatMap(name => [name, uuid]);
        const columnsQuery = `INSERT INTO columns (name, board) VALUES ${columnsPlaceholders}`;


        await db.query('INSERT INTO boards (board_id, name, owner) VALUES (UUID_TO_BIN(?),?,UUID_TO_BIN(?))', [uuid, board.name, userId])
        await db.query(columnsQuery, columnsParams);

        const [[newBoard]] = await db.query(
            `SELECT BIN_TO_UUID(board_id) as boardId, name, timestamp 
            FROM boards 
            WHERE board_id = UUID_TO_BIN(?)`,
            [uuid]
        )
        const [boardColumns] = await db.query('SELECT name FROM columns WHERE board = UUID_TO_BIN(?)', [uuid])

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
            const query = `UPDATE columns SET name = CASE column_id ${whenStatements} END WHERE column_id IN (${ids})`
            await db.query(query)
        }

        if (colsToAdd.length > 0) {
            const params = colsToAdd.map(col => `("${col}", UUID_TO_BIN("${boardId}"))`).join(', ')
            await db.query(`INSERT INTO columns (name, board) VALUES ${params}`, [...colsToAdd])
        }

        const [results] = await db.query('SELECT name FROM boards WHERE BIN_TO_UUID(board_id) = ?', [boardId])
        const [columns] = await db.query('SELECT name FROM columns WHERE BIN_TO_UUID(board) = ?', [boardId])

        return { board: results[0].name, columns }
    }
}
