import { validateUserData } from '../schema/userSchema.js'
import { ValidationError } from '../schema/Errors.js'
import { formatZodError } from './zodError.js'

export function parseUser(data: unknown) {
    const { data: user, error } = validateUserData(data)

    if (error) throw new ValidationError(400, formatZodError(error))

    return user
}