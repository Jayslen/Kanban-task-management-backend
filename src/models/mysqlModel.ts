import { createConnection } from 'mysql2/promise'
import { DB_CONFIG } from '../config.js'

//@ts-ignore
const db = await createConnection(DB_CONFIG)

export class MySqlModel {

}