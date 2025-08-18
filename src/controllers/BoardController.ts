import { Request, Response } from "express";
import { SQLModel } from "@Types/global";
import bycrypt from 'bcrypt'
import { ROUND_SALT } from "../config.js";
import { throwResponseError } from "../schema/Errors.js";
import { parseUser } from "../utils/parseCredentials.js";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../config.js";
import { createJWT } from "../utils/JWT.js";

export class Controller {
    private BoardModel;
    constructor(Model: SQLModel) {
        this.BoardModel = Model
    }

    register = async (req: Request, res: Response) => {
        const userdata = parseUser({ data: req.body, res })
        if (!userdata) return
        const { username, password } = userdata

        try {
            const hashPassword = await bycrypt.hash(password, +ROUND_SALT)
            await this.BoardModel.resister({ password: hashPassword, username })
            res.sendStatus(201)
        } catch (Error) {
            throwResponseError({ error: Error as Error, res })
        }
    }

    login = async (req: Request, res: Response) => {
        const userdata = parseUser({ data: req.body, res })
        if (!userdata) return
        const { username, password } = userdata

        try {
            const data = await this.BoardModel.login({ username, password })
            const ACCESS_TOKEN = createJWT({ data, expiresIn: ACCESS_TOKEN_EXP })
            const REFRESH_TOKEN = createJWT({ data, expiresIn: REFRESH_TOKEN_EXP })

            res.cookie('access_token', ACCESS_TOKEN, {
                httpOnly: true
            })
            res.cookie('refresh_token', REFRESH_TOKEN, {
                httpOnly: true
            })

            res.sendStatus(200)

        } catch (Error) {
            throwResponseError({ error: Error as Error, res })
        }
    }

}