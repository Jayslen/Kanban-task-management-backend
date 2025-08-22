import { Request, Response, NextFunction } from 'express'
import { throwResponseError, UnauthorizedUser } from '../schema/Errors.js'
import { createJWT, verifyToken } from '../utils/JWT.js'
import { isUserSession } from 'src/utils/userSession.js'
import { ACCESS_TOKEN_EXP } from 'src/config.js'

export async function Authorization(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { access_token, refresh_token } = req.cookies

    try {
        if (!access_token || !refresh_token) {
            throw new UnauthorizedUser()
        }

        const { payload, expired } = verifyToken(access_token)
        if (payload) {
            req.user = payload
            return next()
        }

        const { payload: refresh } = expired
            ? verifyToken(refresh_token)
            : { payload: null }

        if (!refresh) {
            throw new UnauthorizedUser()
        }
        const session = await isUserSession(refresh.sessionId)

        if (!session) {
            throw new UnauthorizedUser()
        }

        const newAccessToken = createJWT({
            data: refresh,
            expiresIn: ACCESS_TOKEN_EXP,
        })
        req.user = refresh
        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
        })

        return next()
    } catch (Error) {
        throwResponseError({ res, error: Error as Error })
        return
    }
}
