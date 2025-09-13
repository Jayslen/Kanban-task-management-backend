import { Request, Response, NextFunction } from 'express'
import { verifyToken, createJWT } from '../utils/JWT.js'
import { isUserSession } from '../utils/userSession.js'
import { ACCESS_TOKEN_EXP } from '../config.js'
import { SessionActive, throwResponseError } from '../schema/Errors.js'

export async function denieAuthRoutes(req: Request, res: Response, next: NextFunction) {
    const { access_token, refresh_token } = req.cookies
    if (!access_token || !refresh_token) {
        return next()
    }

    try {
        const { payload, expired } = verifyToken(access_token)

        if (payload) throw new SessionActive()

        if (expired) {
            const { payload: refresh } = verifyToken(refresh_token)

            if (!refresh) {
                return next()
            }

            const session = await isUserSession(refresh.sessionId)
            if (!session) {
                return next()
            }

            const newAccessToken = createJWT({
                data: refresh,
                expiresIn: ACCESS_TOKEN_EXP,
            })

            res.cookie('access_token', newAccessToken, { httpOnly: true })
            throw new SessionActive()
        }

        return next()
    } catch (error) {
        throwResponseError({ res, error })
    }
}

