import { Request, Response } from "express";
import { SQLModel } from "@Types/global";
import { validateUserData } from "src/schema/userSchema.js";
import bycrypt from 'bcrypt'
import { ROUND_SALT } from "src/config.js";
import { throwResponseError } from "src/schema/Errors.js";

export class Controller {
    private BoardModel;
    constructor(Model: SQLModel) {
        this.BoardModel = Model
    }

    register = async (req: Request, res: Response) => {
        const input = req.body
        const result = validateUserData(input)

        if (result.error) {
            const fieldsErrors = result.error.issues.map(data => data.message)
            res.status(400).json({ errors: fieldsErrors })
            return
        }

        const { username, password } = result.data

        try {
            const hashPassword = await bycrypt.hash(password, +ROUND_SALT)
            await this.BoardModel.resister({ password: hashPassword, username })
            res.sendStatus(201)
        } catch (Error) {
            throwResponseError({ error: Error as Error, res })
        }
    }
}