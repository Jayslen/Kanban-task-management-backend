import { createConnection, ResultSetHeader } from 'mysql2/promise'
import { UserDb, UserParams, UserRow, UUIDResponse } from '@Types/global'
import { DB_CONFIG } from '../config.js'
import {
    UserNotAvailable,
    UserNotFound,
    WrongUserPassword,
} from '../schema/Errors.js'
import bcrypt from 'bcrypt'

//@ts-ignore
const db = await createConnection(DB_CONFIG)

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

        //@ts-ignore
        const [[{ uuid }]] = await db.query('SELECT uuid() AS uuid')
        await db.query(
            'INSERT INTO users (user_id, username, password) VALUES (UUID_TO_BIN(?),?,?)',
            [uuid, username, password]
        )
    }

    static login = async (input: { username: string; password: string }) => {
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

        //@ts-ignore
        const [[{ sessionUUID }]] = await db.query('SELECT uuid() AS sessionUUID')
        const [results] = await db.query<ResultSetHeader>(
            'INSERT INTO sessions (session_id,user_id) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?))',
            [sessionUUID, userFound.user_id]
        )

        if (results.affectedRows !== 1) throw new Error('Error with server')

        return { userId: userFound.user_id, sessionId: sessionUUID, username: userFound.username }
    }
}
