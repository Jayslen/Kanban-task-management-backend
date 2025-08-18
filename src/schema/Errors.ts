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

export class UserNotFound extends Error implements ResponseError {
    public statusCode: number
    constructor(message = "No user exit with the username given") {
        super(message)
        this.name = "UserNotFound"
        this.statusCode = 404
    }
}

export class WrongUserPassword extends Error implements ResponseError {
    public statusCode: number
    constructor(message = "Password incorrect") {
        super(message)
        this.name = "WrongPassword"
        this.statusCode = 400
    }
}

const customErrors = [UserNotFound, UserNotAvailable, WrongUserPassword]

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