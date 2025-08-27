import { createConnection, Connection } from "mysql2/promise";
import { DB_CONFIG } from "../config.js";

let connection: Connection | null = null;

export async function getDb(): Promise<Connection> {
    if (!connection) {
        //@ts-expect-error: Type db config
        connection = await createConnection(DB_CONFIG);
    }
    return connection;
}