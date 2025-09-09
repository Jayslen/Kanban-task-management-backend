import { Session } from '@CustomTypes/db'
import { createConnection } from 'mysql2/promise'
import { DB_CONFIG } from '../config.js'

export async function isUserSession(sessionId: string) {
    const db = await createConnection(DB_CONFIG)

    const [rows] = await db.query<Session[]>('SELECT * FROM sessions WHERE session_id = UUID_TO_BIN(?)', [sessionId])

    return rows.length > 0

}