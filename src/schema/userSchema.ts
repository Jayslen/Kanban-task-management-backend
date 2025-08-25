import z from 'zod'

export const userSchema = z.object({
    username: z.string().trim().min(4).max(30),
    password: z.string().trim().min(8).max(50)
})

export function validateUserData(input: unknown) {
    return userSchema.safeParse(input)
}