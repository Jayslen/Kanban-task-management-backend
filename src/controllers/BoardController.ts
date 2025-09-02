import { Request, Response } from "express";
import bycrypt from 'bcrypt'
import { SQLModel } from "@Types/global";
import { ROUND_SALT } from "../config.js";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../config.js";
import { parseUser } from "../utils/parseCredentials.js";
import { createJWT } from "../utils/JWT.js";
import { throwResponseError, ValidationError } from "../schema/Errors.js";
import { validateBoardColumnsSchema, validateBoardSchema, validateTaskBoard } from "../schema/boardSchema.js";
import { formatZodError } from "src/utils/zodError.js";

export class Controller {
    private BoardModel;
    constructor(Model: SQLModel) {
        this.BoardModel = Model
    }

    register = async (req: Request, res: Response) => {
        try {
            const userdata = parseUser(req.body)
            if (!userdata) return
            const { username, password } = userdata

            const hashPassword = await bycrypt.hash(password, +ROUND_SALT)
            await this.BoardModel.resister({ password: hashPassword, username })
            res.sendStatus(201)
        } catch (Error) {
            throwResponseError({ error: Error as Error, res })
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const userdata = parseUser(req.body)
            if (!userdata) return
            const { username, password } = userdata

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

        try {
            const { success, data, error } = validateBoardSchema(boardInput)

            if (!success) throw new ValidationError(400, formatZodError(error))

            const newBoard = await this.BoardModel.newBoard({ board: data, userId: user?.userId })
            res.status(201).json(newBoard)
        } catch (error) {
            throwResponseError({ error: error as Error, res })
        }
    }

    updateBoard = async (req: Request, res: Response) => {
        try {
            const input = req.body
            const { boardId } = req.params

            const { success, data, error } = validateBoardColumnsSchema(input)

            if (!success) throw new ValidationError(400, formatZodError(error))

            const { columns: { add: newCols, edit: existCols }, name } = data

            const colsToRemove = existCols?.filter(col => col.remove).map(({ id, remove }) => ({ id, remove: !!remove }))

            const colsToUpdate = existCols
                ?.filter((col): col is { id: number, payload: string } => col.payload !== undefined)
                ?.map(({ id, payload }) => ({ id, payload: payload }))


            const updatedBoard = await this.BoardModel.updateBoard({ colsToRemove, colsToUpdate, colsToAdd: newCols, name, boardId })

            res.status(200).json(updatedBoard)
        } catch (error) {
            throwResponseError({ error, res })
        }
    }

    deleteBoard = async (req: Request, res: Response) => {
        const { boardId } = req.params
        try {
            await this.BoardModel.deleteBoard(boardId)
            res.sendStatus(200)
        } catch (error) {
            throwResponseError({ error, res })
        }

    }

    createTask = async (req: Request, res: Response) => {
        const { boardId } = req.params
        const input = req.body

        try {
            const { success, data, error } = validateTaskBoard(input)
            if (!success) throw new ValidationError(400, formatZodError(error))

            const taskCreated = await this.BoardModel.createTask({ boardId, task: data })
            res.status(201).json(taskCreated)
        } catch (error) {
            throwResponseError({ error, res })
        }
    }

}