import { validateUserData } from '../schema/userSchema.js'
import { ValidationError } from '../schema/Errors.js'

export function parseUser(data: unknown) {
    const { data: user, error } = validateUserData(data)

    if (error) throw new ValidationError(400, error.issues.map(data => data.message))

    return user
}