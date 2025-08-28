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

export class UnauthorizedUser extends Error implements ResponseError {
    public statusCode: number
    constructor(message = "Need to be authentificated") {
        super(message)
        this.name = "Unauthorized"
        this.statusCode = 401
    }
}

export class BoardNotFound extends Error implements ResponseError {
    public statusCode: number
    constructor(message = "The board requested was not found") {
        super(message)
        this.name = "BoardNotFound"
        this.statusCode = 404
    }
}

export class ValidationError extends Error implements ResponseError {
    public statusCode: number
    public errors: string[]
    constructor(statusCode: number, errors: string[]) {
        super("The data send is not well structure. Try again")
        this.name = "ValidationError"
        this.statusCode = statusCode
        this.errors = errors
    }
}

const customErrors = [UserNotFound, UserNotAvailable, WrongUserPassword, UnauthorizedUser, BoardNotFound, ValidationError]

export function throwResponseError(input: { res: Response, error: unknown }) {
    const { error, res } = input

    const isCustomError = customErrors.some(err => error instanceof err)
    const { name, statusCode = 500, message, errors } = error as ResponseError

    const response = {
        errorName: isCustomError ? name : "Internal Error",
        message: isCustomError ? message : "Something unexpected happend in the server",
        code: statusCode,
        cause: errors
    }

    console.error(error)
    res.status(statusCode).json(response)
} 