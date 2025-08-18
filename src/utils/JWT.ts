import jwt from 'jsonwebtoken'
import { TOKEN_SECRET_KEY } from '../config.js'

export function createJWT(input: { data: any, expiresIn: any }) {
    const { data, expiresIn = "1m" } = input

    return jwt.sign(data, TOKEN_SECRET_KEY, { expiresIn })
}