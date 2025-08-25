import { Request, Response } from "express";
import bycrypt from 'bcrypt'
import { SQLModel } from "@Types/global";
import { ROUND_SALT } from "../config.js";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../config.js";
import { parseUser } from "../utils/parseCredentials.js";
import { createJWT } from "../utils/JWT.js";
import { throwResponseError } from "../schema/Errors.js";
import { validateBoardSchema } from "../schema/boardSchema.js";

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

    newBoard = async (req: Request, res: Response) => {
        const boardInput = req.body
        const user = req.user

        if (!user) return res.sendStatus(403)

        const { success, data, error } = validateBoardSchema(boardInput)

        if (!success) {
            const fieldsErrors = error.issues.map(data => `${data.path}: ${data.message}`)
            return res.status(400).json({ errors: fieldsErrors })
        }
        try {
            const newBoard = await this.BoardModel.newBoard({ board: data, userId: user?.userId })
            res.status(201).json(newBoard)
        } catch (error) {
            throwResponseError({ error: error as Error, res })
        }
    }

}