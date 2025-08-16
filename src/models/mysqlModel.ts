import { createConnection } from 'mysql2/promise'
import { DB_CONFIG } from '../config.js'
import { UserParams, UserRow } from '@Types/global'
import { UserNotAvailable } from '../schema/Errors.js'

//@ts-ignore
const db = await createConnection(DB_CONFIG)

export class MySqlModel {
    static resister = async (input: UserParams) => {
        const { username, password } = input

        const [users] = await db.query<UserRow[]>('SELECT username FROM users WHERE LOWER(username) = LOWER(?)', [username])

        if (users.length > 0) {
            throw new UserNotAvailable()
        }

        //@ts-ignore
        const [[{ uuid }]] = await db.query('SELECT uuid() AS uuid')
        await db.query('INSERT INTO users (user_id, username, password) VALUES (UUID_TO_BIN(?),?,?)', [uuid, username, password])
    }
}