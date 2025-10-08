import { Request, Response, NextFunction } from "express";
import { throwResponseError, UnauthorizedUser } from "../schema/Errors.js";
import { verifyToken } from "../utils/JWT.js";


export function VerifyUserOnLogout(req: Request, res: Response, next: NextFunction) {
    const { access_token } = req.cookies
    try {
        if (!access_token) throw new UnauthorizedUser("User not authentificated")
        const data = verifyToken(access_token)
        if (!data.payload || data.expired) throw new UnauthorizedUser("User not authentificated")
        req.user = data.payload
        next()
    } catch (error) {
        return throwResponseError({ error: error as Error, res })
    }
}