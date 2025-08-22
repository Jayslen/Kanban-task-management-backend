import jwt from 'jsonwebtoken'
import { TOKEN_SECRET_KEY } from '../config.js'
import { Payload, VerifyResult } from '@Types/global'

export function createJWT(input: { data: any, expiresIn: any }) {
    const { data, expiresIn = "1m" } = input

    return jwt.sign(data, TOKEN_SECRET_KEY, { expiresIn })
}

export function verifyToken(token: string): VerifyResult {
    try {
        const verifiedToken = jwt.verify(token, TOKEN_SECRET_KEY) as jwt.JwtPayload
        if (typeof verifiedToken && typeof verifiedToken === "object") {
            const { userId, sessionId, username } = verifiedToken as Payload
            return { payload: { userId, sessionId, username }, expired: false }
        }
        return { payload: null, expired: false }
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { payload: null, expired: true }
        }
        console.error("JWT verification error:", error);
        return { payload: null, expired: false };
    }

}