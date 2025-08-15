import { Response } from 'express'
import { ResponseError } from '@Types/global'

export class UserNotAvailable extends Error implements ResponseError {
    public statusCode: number
    constructor(message = "The username is alredy taken") {
        super(message)
        this.name = "UsernameTaken"
        this.statusCode = 400
    }
}

const customErrors = [UserNotAvailable]

export function throwResponseError(input: { res: Response, error: Error }) {
    const { error, res } = input

    const isCustomError = customErrors.some(err => error instanceof err)
    const { name, statusCode = 500, message } = error as ResponseError

    const response = {
        error: isCustomError ? name : "Internal Error",
        message: isCustomError ? message : "Something unexpected happend in the server",
        code: statusCode
    }

    console.error(error)
    res.status(statusCode).json(response)
} 