import z from 'zod'
process.loadEnvFile()

const { HOST = 'localhost', USER = 'root', PORT = '3000', DATABASE = 'test' } = process.env

export const { SERVER_PORT } = process.env

export const DB_CONFIG = {
    host: HOST,
    user: USER,
    port: PORT,
    database: DATABASE,
    waitForConnections: true,
    connectionLimit: 10
}

z.config({
    customError: (iss) => {
        if (iss.code === 'too_small' && iss.origin === 'string') {
            return `The field ${iss.path} is too short. Minimum length is ${iss.minimum} characters.`;
        }
    }
})