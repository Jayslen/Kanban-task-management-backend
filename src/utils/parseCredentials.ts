import { Response } from 'express'
import { validateUserData } from '../schema/userSchema.js'


export function parseUser(input: { data: unknown, res: Response }) {
    const { data, res } = input
    const userData = validateUserData(data)

    if (userData.error) {
        const fieldsErrors = userData.error.issues.map(data => data.message)

        res.status(400).json({ errors: fieldsErrors })
    }

    return userData.data
}